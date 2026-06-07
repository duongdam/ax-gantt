-- =============================================================================
-- AxGantt - Drop all objects (Oracle 19c, DBeaver)
-- Module Mendix: Simulator — drops sim_* (+ legacy pm_*)
-- Optional: oracle-axgantt-scale.sql already drops before create (idempotent)
-- DBeaver: Execute SQL Script (Alt+X) - NOT Ctrl+Enter per line
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
BEGIN
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
END;
