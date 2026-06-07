-- =============================================================================
-- AxGantt - Idempotent DDL (Oracle 19c, DBeaver Alt+X)
-- Module Mendix: Simulator — lab tables prefix sim_* (maps simulator$*)
-- Drops existing objects (incl. legacy pm_*), then creates sequences + tables
-- Then: oracle-axgantt-scale-seed.sql, oracle-axgantt-scale-view.sql (optional)
-- W## via CHR(35) - no # char in this file (DBeaver safe)
-- =============================================================================

DECLARE
    PROCEDURE safe_drop(p_sql VARCHAR2) IS
    BEGIN
        EXECUTE IMMEDIATE p_sql;
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE NOT IN (-942, -2289, -4043) THEN
                RAISE;
            END IF;
    END;

    PROCEDURE exec_ddl(p_sql VARCHAR2) IS
    BEGIN
        EXECUTE IMMEDIATE p_sql;
    END;
BEGIN
    -- Phase 1: drop sim_* (current) + legacy pm_* (older scripts)
    safe_drop('DROP VIEW v_sim_scale_json');
    safe_drop('DROP VIEW v_pm_scale_json');
    safe_drop('DROP TABLE sim_scale_row CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE sim_scale CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE sim_scale_tpl_row CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE sim_scale_tpl CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE sim_roadmap CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE pm_scale_row CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE pm_scale CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE pm_scale_tpl_row CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE pm_scale_tpl CASCADE CONSTRAINTS');
    safe_drop('DROP TABLE pm_roadmap CASCADE CONSTRAINTS');
    safe_drop('DROP SEQUENCE sim_scale_row_seq');
    safe_drop('DROP SEQUENCE sim_scale_seq');
    safe_drop('DROP SEQUENCE sim_scale_tpl_row_seq');
    safe_drop('DROP SEQUENCE sim_scale_tpl_seq');
    safe_drop('DROP SEQUENCE sim_roadmap_seq');
    safe_drop('DROP SEQUENCE pm_scale_row_seq');
    safe_drop('DROP SEQUENCE pm_scale_seq');
    safe_drop('DROP SEQUENCE pm_scale_tpl_row_seq');
    safe_drop('DROP SEQUENCE pm_scale_tpl_seq');
    safe_drop('DROP SEQUENCE pm_roadmap_seq');

    -- Phase 2: create
    exec_ddl('CREATE SEQUENCE sim_roadmap_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE');
    exec_ddl('CREATE SEQUENCE sim_scale_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE');
    exec_ddl('CREATE SEQUENCE sim_scale_row_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE');
    exec_ddl('CREATE SEQUENCE sim_scale_tpl_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE');
    exec_ddl('CREATE SEQUENCE sim_scale_tpl_row_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE');

    exec_ddl(
        'CREATE TABLE sim_roadmap (' ||
        ' id NUMBER(20) NOT NULL,' ||
        ' doc_no VARCHAR2(64) NOT NULL,' ||
        ' revision VARCHAR2(16),' ||
        ' revised_by VARCHAR2(128),' ||
        ' revised_at TIMESTAMP(6),' ||
        ' gantt_start DATE NOT NULL,' ||
        ' gantt_end DATE NOT NULL,' ||
        ' is_active NUMBER(1) DEFAULT 1 NOT NULL,' ||
        ' created_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' updated_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' CONSTRAINT pk_sim_roadmap PRIMARY KEY (id),' ||
        ' CONSTRAINT uk_sim_roadmap_doc UNIQUE (doc_no, revision),' ||
        ' CONSTRAINT ck_sim_roadmap_dates CHECK (gantt_end >= gantt_start),' ||
        ' CONSTRAINT ck_sim_roadmap_active CHECK (is_active IN (0, 1))' ||
        ')'
    );

    exec_ddl('CREATE INDEX ix_sim_roadmap_active ON sim_roadmap (is_active, gantt_start)');
    exec_ddl('COMMENT ON TABLE sim_roadmap IS ''Roadmap header and timeline bounds''');
    exec_ddl('COMMENT ON COLUMN sim_roadmap.gantt_start IS ''Widget ganttStartDate''');
    exec_ddl('COMMENT ON COLUMN sim_roadmap.gantt_end IS ''Widget ganttEndDate''');

    exec_ddl(
        'CREATE TABLE sim_scale_tpl (' ||
        ' id NUMBER(20) NOT NULL,' ||
        ' code VARCHAR2(32) NOT NULL,' ||
        ' display_name VARCHAR2(128) NOT NULL,' ||
        ' anchor_year NUMBER(4) NOT NULL,' ||
        ' week_fmt VARCHAR2(8) DEFAULT (''W'' || CHR(35) || CHR(35)) NOT NULL,' ||
        ' is_default NUMBER(1) DEFAULT 0 NOT NULL,' ||
        ' is_active NUMBER(1) DEFAULT 1 NOT NULL,' ||
        ' created_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' updated_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' CONSTRAINT pk_sim_scale_tpl PRIMARY KEY (id),' ||
        ' CONSTRAINT uk_sim_scale_tpl_code UNIQUE (code),' ||
        ' CONSTRAINT ck_sim_scale_tpl_year CHECK (anchor_year BETWEEN 1970 AND 2100),' ||
        ' CONSTRAINT ck_sim_scale_tpl_week_fmt CHECK (' ||
        ' week_fmt = (''W'' || CHR(35) || CHR(35)) OR week_fmt = (''T'' || CHR(35) || CHR(35))),' ||
        ' CONSTRAINT ck_sim_scale_tpl_default CHECK (is_default IN (0, 1)),' ||
        ' CONSTRAINT ck_sim_scale_tpl_active CHECK (is_active IN (0, 1))' ||
        ')'
    );

    exec_ddl(
        'CREATE TABLE sim_scale_tpl_row (' ||
        ' id NUMBER(20) NOT NULL,' ||
        ' tpl_id NUMBER(20) NOT NULL,' ||
        ' sort_no NUMBER(5) NOT NULL,' ||
        ' unit VARCHAR2(16) NOT NULL,' ||
        ' step_val NUMBER(5) DEFAULT 1 NOT NULL,' ||
        ' fmt_key VARCHAR2(32) NOT NULL,' ||
        ' CONSTRAINT pk_sim_scale_tpl_row PRIMARY KEY (id),' ||
        ' CONSTRAINT uk_sim_scale_tpl_row_order UNIQUE (tpl_id, sort_no),' ||
        ' CONSTRAINT fk_sim_scale_tpl_row_tpl FOREIGN KEY (tpl_id) REFERENCES sim_scale_tpl (id) ON DELETE CASCADE,' ||
        ' CONSTRAINT ck_sim_scale_tpl_row_sort CHECK (sort_no >= 0),' ||
        ' CONSTRAINT ck_sim_scale_tpl_row_step CHECK (step_val >= 1),' ||
        ' CONSTRAINT ck_sim_scale_tpl_row_unit CHECK (unit IN (''year'', ''month'', ''week'', ''day''))' ||
        ')'
    );

    exec_ddl(
        'CREATE TABLE sim_scale (' ||
        ' id NUMBER(20) NOT NULL,' ||
        ' roadmap_id NUMBER(20) NOT NULL,' ||
        ' anchor_year NUMBER(4) NOT NULL,' ||
        ' week_fmt VARCHAR2(8) DEFAULT (''W'' || CHR(35) || CHR(35)) NOT NULL,' ||
        ' display_name VARCHAR2(128),' ||
        ' note VARCHAR2(512),' ||
        ' tpl_id NUMBER(20),' ||
        ' created_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' updated_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' CONSTRAINT pk_sim_scale PRIMARY KEY (id),' ||
        ' CONSTRAINT uk_sim_scale_roadmap UNIQUE (roadmap_id),' ||
        ' CONSTRAINT fk_sim_scale_roadmap FOREIGN KEY (roadmap_id) REFERENCES sim_roadmap (id) ON DELETE CASCADE,' ||
        ' CONSTRAINT fk_sim_scale_tpl FOREIGN KEY (tpl_id) REFERENCES sim_scale_tpl (id),' ||
        ' CONSTRAINT ck_sim_scale_year CHECK (anchor_year BETWEEN 1970 AND 2100),' ||
        ' CONSTRAINT ck_sim_scale_week_fmt CHECK (' ||
        ' week_fmt = (''W'' || CHR(35) || CHR(35)) OR week_fmt = (''T'' || CHR(35) || CHR(35)))' ||
        ')'
    );

    exec_ddl('COMMENT ON TABLE sim_scale IS ''scaleJson root: anchorYear and weekLabelFormat''');

    exec_ddl(
        'CREATE TABLE sim_scale_row (' ||
        ' id NUMBER(20) NOT NULL,' ||
        ' scale_id NUMBER(20) NOT NULL,' ||
        ' sort_no NUMBER(5) NOT NULL,' ||
        ' unit VARCHAR2(16) NOT NULL,' ||
        ' step_val NUMBER(5) DEFAULT 1 NOT NULL,' ||
        ' fmt_key VARCHAR2(32) NOT NULL,' ||
        ' created_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' updated_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,' ||
        ' CONSTRAINT pk_sim_scale_row PRIMARY KEY (id),' ||
        ' CONSTRAINT uk_sim_scale_row_order UNIQUE (scale_id, sort_no),' ||
        ' CONSTRAINT fk_sim_scale_row_scale FOREIGN KEY (scale_id) REFERENCES sim_scale (id) ON DELETE CASCADE,' ||
        ' CONSTRAINT ck_sim_scale_row_sort CHECK (sort_no >= 0),' ||
        ' CONSTRAINT ck_sim_scale_row_step CHECK (step_val >= 1),' ||
        ' CONSTRAINT ck_sim_scale_row_unit CHECK (unit IN (''year'', ''month'', ''week'', ''day'')),' ||
        ' CONSTRAINT ck_sim_scale_row_fmt CHECK (' ||
        ' (unit = ''year'' AND fmt_key IN (''year'', ''YYYY''))' ||
        ' OR (unit = ''week'' AND (fmt_key = (''W'' || CHR(35) || CHR(35)) OR fmt_key = (''T'' || CHR(35) || CHR(35))))' ||
        ' OR (unit = ''month'' AND fmt_key IN (''month'', ''MMM YYYY'', ''MM/YYYY''))' ||
        ' OR (unit = ''day'' AND fmt_key IN (''day'', ''dd MMM'', ''DD/MM''))' ||
        ' )' ||
        ')'
    );

    exec_ddl('COMMENT ON TABLE sim_scale_row IS ''scaleJson.scales array ordered by sort_no''');
END;
