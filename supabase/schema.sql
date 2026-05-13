-- ============================================================
-- Roomie Match Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  age             INTEGER CHECK (age >= 16 AND age <= 99),
  university      TEXT NOT NULL DEFAULT '',
  year_of_study   INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 8),
  gender          TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  avatar_url      TEXT,
  bio             TEXT DEFAULT '',
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.lifestyle_preferences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sleep_schedule    TEXT NOT NULL DEFAULT 'flexible'
                    CHECK (sleep_schedule IN ('night_owl', 'early_bird', 'flexible')),
  cleanliness_level INTEGER NOT NULL DEFAULT 3
                    CHECK (cleanliness_level BETWEEN 1 AND 5),
  social_preference TEXT NOT NULL DEFAULT 'balanced'
                    CHECK (social_preference IN ('social', 'private', 'balanced')),
  smoking           TEXT NOT NULL DEFAULT 'non_smoker'
                    CHECK (smoking IN ('smoker', 'non_smoker', 'outside_only')),
  guests_frequency  TEXT NOT NULL DEFAULT 'occasionally'
                    CHECK (guests_frequency IN ('often', 'occasionally', 'rarely', 'never')),
  noise_tolerance   TEXT NOT NULL DEFAULT 'moderate'
                    CHECK (noise_tolerance IN ('quiet', 'moderate', 'loud')),
  pet_friendly      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_interests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.housing_requirements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  budget_min      INTEGER NOT NULL DEFAULT 400,
  budget_max      INTEGER NOT NULL DEFAULT 1200,
  preferred_areas TEXT[] NOT NULL DEFAULT '{}',
  group_size      INTEGER NOT NULL DEFAULT 2
                  CHECK (group_size BETWEEN 2 AND 8),
  move_in_date    DATE,
  duration        TEXT NOT NULL DEFAULT 'flexible'
                  CHECK (duration IN ('short_term', 'academic_year', 'long_term', 'flexible')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.matches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'accepted', 'rejected')),
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_match CHECK (requester_id <> receiver_id),
  CONSTRAINT unique_match   UNIQUE (requester_id, receiver_id)
);

CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) > 0),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_matches_requester  ON public.matches(requester_id);
CREATE INDEX idx_matches_receiver   ON public.matches(receiver_id);
CREATE INDEX idx_matches_status     ON public.matches(status);
CREATE INDEX idx_messages_match     ON public.messages(match_id);
CREATE INDEX idx_messages_sender    ON public.messages(sender_id);
CREATE INDEX idx_messages_created   ON public.messages(created_at DESC);
CREATE INDEX idx_profiles_university ON public.profiles(university);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lifestyle_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.housing_requirements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;

-- profiles: everyone can read, only owner can write
CREATE POLICY "profiles_select_all"  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- lifestyle_preferences
CREATE POLICY "lifestyle_select_all" ON public.lifestyle_preferences FOR SELECT USING (TRUE);
CREATE POLICY "lifestyle_insert_own" ON public.lifestyle_preferences FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "lifestyle_update_own" ON public.lifestyle_preferences FOR UPDATE
  USING (auth.uid() = profile_id);

-- user_interests
CREATE POLICY "interests_select_all" ON public.user_interests FOR SELECT USING (TRUE);
CREATE POLICY "interests_insert_own" ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "interests_update_own" ON public.user_interests FOR UPDATE
  USING (auth.uid() = profile_id);

-- housing_requirements
CREATE POLICY "housing_select_all"   ON public.housing_requirements FOR SELECT USING (TRUE);
CREATE POLICY "housing_insert_own"   ON public.housing_requirements FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "housing_update_own"   ON public.housing_requirements FOR UPDATE
  USING (auth.uid() = profile_id);

-- matches: visible only to participants
CREATE POLICY "matches_select_own" ON public.matches FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "matches_insert_own" ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "matches_update_receiver" ON public.matches FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- messages: visible only to match participants
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.requester_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND m.status = 'accepted'
        AND (m.requester_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );
CREATE POLICY "messages_update_read" ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.requester_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND (m.requester_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );

-- ============================================================
-- REALTIME PUBLICATION
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
