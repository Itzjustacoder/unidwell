-- Run this in Supabase SQL Editor to add all new features

-- 1. New columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS match_same_origin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Deal breaker on lifestyle_preferences
ALTER TABLE public.lifestyle_preferences
  ADD COLUMN IF NOT EXISTS deal_breaker TEXT NOT NULL DEFAULT 'none'
    CHECK (deal_breaker IN ('noise','smoking','guests','pets','cleanliness','early_riser','night_owl','none'));

-- 3. Group chat tables
CREATE TABLE IF NOT EXISTS public.groups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.group_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  sender_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Flat listings + swipes
CREATE TABLE IF NOT EXISTS public.flat_listings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  area           TEXT NOT NULL,
  price          INTEGER NOT NULL,
  bedrooms       INTEGER NOT NULL DEFAULT 1,
  image_url      TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  available_from DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.flat_swipes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flat_id    UUID REFERENCES public.flat_listings(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id   UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  direction  TEXT NOT NULL CHECK (direction IN ('like','pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flat_id, profile_id, match_id)
);

-- 5. Enable RLS
ALTER TABLE public.groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flat_listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flat_swipes    ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies
CREATE POLICY "groups_select_member" ON public.groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = id AND gm.profile_id = auth.uid()));
CREATE POLICY "groups_insert_own" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "group_members_select" ON public.group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.profile_id = auth.uid()));
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.created_by = auth.uid()) OR auth.uid() = profile_id);

CREATE POLICY "group_messages_select" ON public.group_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.profile_id = auth.uid()));
CREATE POLICY "group_messages_insert" ON public.group_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.profile_id = auth.uid()));

CREATE POLICY "flat_listings_select_all" ON public.flat_listings FOR SELECT USING (TRUE);

CREATE POLICY "flat_swipes_select_own" ON public.flat_swipes FOR SELECT
  USING (auth.uid() = profile_id OR EXISTS (
    SELECT 1 FROM public.matches m WHERE m.id = match_id
      AND (m.requester_id = auth.uid() OR m.receiver_id = auth.uid())
  ));
CREATE POLICY "flat_swipes_insert_own" ON public.flat_swipes FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "flat_swipes_upsert_own" ON public.flat_swipes FOR UPDATE USING (auth.uid() = profile_id);

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flat_swipes;
