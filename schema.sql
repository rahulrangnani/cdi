-- Digital Initiatives Platform — Oracle Database 19c+ schema
-- Run in a dedicated application schema (for example INITIATIVES_APP).
-- Authentication, authorization and file storage are handled by the backend API.

CREATE TABLE app_users (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  email VARCHAR2(320 CHAR) NOT NULL UNIQUE,
  password_hash VARCHAR2(255 CHAR) NOT NULL,
  full_name VARCHAR2(255 CHAR), avatar_url VARCHAR2(2048 CHAR),
  is_active NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0,1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE user_roles (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  user_id RAW(16) NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role VARCHAR2(20 CHAR) DEFAULT 'user' NOT NULL CHECK (role IN ('admin','user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uq_user_roles UNIQUE (user_id, role)
);
CREATE TABLE initiatives (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  name VARCHAR2(255 CHAR) NOT NULL UNIQUE,
  description CLOB, category VARCHAR2(255 CHAR), status VARCHAR2(30 CHAR) DEFAULT 'active' NOT NULL,
  logo_url VARCHAR2(2048 CHAR), overview CLOB,
  parent_id RAW(16), level_name VARCHAR2(20 CHAR) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_initiatives_parent FOREIGN KEY (parent_id) REFERENCES initiatives(id) ON DELETE SET NULL,
  CONSTRAINT ck_initiatives_level CHECK (level_name IN ('bucket','category','initiative'))
);
CREATE INDEX idx_initiatives_parent_id ON initiatives(parent_id);
CREATE TABLE partners (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  name VARCHAR2(255 CHAR) NOT NULL, website VARCHAR2(2048 CHAR), logo_url VARCHAR2(2048 CHAR),
  partner_type VARCHAR2(100 CHAR), status VARCHAR2(30 CHAR) DEFAULT 'active' NOT NULL,
  contact_name VARCHAR2(255 CHAR), contact_email VARCHAR2(320 CHAR), contact_phone VARCHAR2(50 CHAR),
  support_email VARCHAR2(320 CHAR), support_phone VARCHAR2(50 CHAR), support_hours VARCHAR2(255 CHAR),
  escalation_matrix CLOB DEFAULT '{}' NOT NULL CHECK (escalation_matrix IS JSON),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE products (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  name VARCHAR2(255 CHAR) NOT NULL, description CLOB, category VARCHAR2(255 CHAR),
  is_active NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0,1)), display_order NUMBER(10) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE initiative_partners (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_id RAW(16) NOT NULL REFERENCES initiatives(id), partner_id RAW(16) NOT NULL REFERENCES partners(id),
  pricing_per_call NUMBER(18,4), pricing_unit VARCHAR2(100 CHAR) DEFAULT 'Per Call', currency VARCHAR2(10 CHAR) DEFAULT 'INR',
  sla_percentage NUMBER(5,2), integration_cost NUMBER(18,2), annual_cost NUMBER(18,2),
  terms_and_conditions CLOB, billing_contact CLOB,
  custom_commercial_fields CLOB DEFAULT '[]' CHECK (custom_commercial_fields IS JSON),
  api_documentation CLOB, api_version VARCHAR2(50 CHAR) DEFAULT '1.0', api_notes CLOB,
  uat_api_key CLOB, production_api_key CLOB, api_request_sample CLOB, api_response_sample CLOB,
  media_url VARCHAR2(2048 CHAR), media_title VARCHAR2(500 CHAR), media_description CLOB,
  media_type VARCHAR2(30 CHAR) DEFAULT 'video', partner_rank NUMBER(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE initiative_partner_products (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_partner_id RAW(16) NOT NULL REFERENCES initiative_partners(id),
  product_id RAW(16) NOT NULL REFERENCES products(id), usage_status VARCHAR2(30 CHAR) DEFAULT 'planned',
  implementation_date DATE, notes CLOB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE api_specifications (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_partner_id RAW(16) NOT NULL REFERENCES initiative_partners(id), version VARCHAR2(50 CHAR) DEFAULT '1.0' NOT NULL,
  openapi_json CLOB CHECK (openapi_json IS JSON),
  input_parameters CLOB DEFAULT '[]' CHECK (input_parameters IS JSON),
  output_parameters CLOB DEFAULT '[]' CHECK (output_parameters IS JSON),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE api_documents (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_partner_id RAW(16) NOT NULL REFERENCES initiative_partners(id) ON DELETE CASCADE,
  title VARCHAR2(500 CHAR) NOT NULL, file_path VARCHAR2(2048 CHAR) NOT NULL, file_name VARCHAR2(500 CHAR) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE partner_features (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_partner_id RAW(16) NOT NULL REFERENCES initiative_partners(id) ON DELETE CASCADE,
  feature_name VARCHAR2(500 CHAR) NOT NULL, is_available NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_available IN (0,1)), notes CLOB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE TABLE support_details (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  initiative_partner_id RAW(16) NOT NULL UNIQUE REFERENCES initiative_partners(id),
  production_contact_name VARCHAR2(255 CHAR), production_contact_email VARCHAR2(320 CHAR), production_contact_phone VARCHAR2(50 CHAR),
  sandbox_contact CLOB, known_issues CLOB,
  faq CLOB DEFAULT '[]' CHECK (faq IS JSON),
  escalation_matrix CLOB DEFAULT '{}' NOT NULL CHECK (escalation_matrix IS JSON),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE OR REPLACE TRIGGER trg_initiatives_hierarchy
BEFORE INSERT OR UPDATE ON initiatives FOR EACH ROW
DECLARE v_parent_level initiatives.level_name%TYPE;
BEGIN
  IF :NEW.level_name = 'bucket' THEN
    IF :NEW.parent_id IS NOT NULL THEN RAISE_APPLICATION_ERROR(-20001, 'Bucket rows must have no parent'); END IF;
  ELSE
    IF :NEW.parent_id IS NULL THEN RAISE_APPLICATION_ERROR(-20002, 'Non-bucket rows require a parent'); END IF;
    SELECT level_name INTO v_parent_level FROM initiatives WHERE id = :NEW.parent_id;
    IF :NEW.level_name = 'category' AND v_parent_level <> 'bucket' THEN RAISE_APPLICATION_ERROR(-20003, 'Category parent must be a bucket'); END IF;
    IF :NEW.level_name = 'initiative' AND v_parent_level <> 'category' THEN RAISE_APPLICATION_ERROR(-20004, 'Initiative parent must be a category'); END IF;
  END IF;
END;
/

-- Maintain UPDATED_AT. Repeat this trigger pattern for each table listed below.
CREATE OR REPLACE TRIGGER trg_app_users_updated BEFORE UPDATE ON app_users FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_initiatives_updated BEFORE UPDATE ON initiatives FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_partners_updated BEFORE UPDATE ON partners FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_init_partners_updated BEFORE UPDATE ON initiative_partners FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_ipp_updated BEFORE UPDATE ON initiative_partner_products FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_api_specs_updated BEFORE UPDATE ON api_specifications FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_api_docs_updated BEFORE UPDATE ON api_documents FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_features_updated BEFORE UPDATE ON partner_features FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/
CREATE OR REPLACE TRIGGER trg_support_updated BEFORE UPDATE ON support_details FOR EACH ROW BEGIN :NEW.updated_at := SYSTIMESTAMP; END;
/

-- Create the runtime user as a DBA, then grant only runtime privileges:
-- CREATE USER initiatives_api IDENTIFIED BY "<strong-password>";
-- GRANT CREATE SESSION TO initiatives_api;
-- BEGIN FOR t IN (SELECT table_name FROM user_tables) LOOP EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE, DELETE ON '||t.table_name||' TO initiatives_api'; END LOOP; END;
-- /
-- First admin, after signup (UUID string converted to RAW):
-- INSERT INTO user_roles (user_id, role) VALUES (HEXTORAW(REPLACE('<uuid>','-','')), 'admin');
-- COMMIT;
