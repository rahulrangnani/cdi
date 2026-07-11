
-- 1. Add level column (nullable initially for backfill)
ALTER TABLE public.initiatives ADD COLUMN level TEXT;

-- 2. Backfill level based on current shape
UPDATE public.initiatives SET level = 'category' WHERE parent_id IS NULL;
UPDATE public.initiatives SET level = 'initiative' WHERE parent_id IS NOT NULL;

-- 3. Create default "General" bucket and re-parent existing categories
DO $$
DECLARE
  v_bucket_id UUID;
BEGIN
  INSERT INTO public.initiatives (name, description, status, level, parent_id)
  VALUES ('General', 'Default bucket for existing categories', 'active', 'bucket', NULL)
  RETURNING id INTO v_bucket_id;

  UPDATE public.initiatives
  SET parent_id = v_bucket_id
  WHERE level = 'category' AND id <> v_bucket_id;
END $$;

-- 4. Enforce constraints
ALTER TABLE public.initiatives ALTER COLUMN level SET NOT NULL;
ALTER TABLE public.initiatives ADD CONSTRAINT initiatives_level_check
  CHECK (level IN ('bucket', 'category', 'initiative'));

-- 5. Validation trigger: parent/level relationships
CREATE OR REPLACE FUNCTION public.validate_initiative_hierarchy()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_parent_level TEXT;
BEGIN
  IF NEW.level = 'bucket' THEN
    IF NEW.parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Bucket rows must have parent_id NULL';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.parent_id IS NULL THEN
    RAISE EXCEPTION 'Non-bucket rows must have a parent_id';
  END IF;

  SELECT level INTO v_parent_level FROM public.initiatives WHERE id = NEW.parent_id;

  IF NEW.level = 'category' AND v_parent_level <> 'bucket' THEN
    RAISE EXCEPTION 'Category rows must have a bucket parent (got %)', v_parent_level;
  END IF;

  IF NEW.level = 'initiative' AND v_parent_level <> 'category' THEN
    RAISE EXCEPTION 'Initiative rows must have a category parent (got %)', v_parent_level;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_initiative_hierarchy
BEFORE INSERT OR UPDATE ON public.initiatives
FOR EACH ROW EXECUTE FUNCTION public.validate_initiative_hierarchy();
