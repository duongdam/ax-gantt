-- =============================================================================
-- AxGantt - View v_sim_scale_json (Oracle 19c, Simulator / sim_*)
-- Run AFTER oracle-axgantt-scale.sql (+ seed optional)
-- If JSON fails, build scaleJson in Mendix microflow instead
-- =============================================================================

DECLARE
    PROCEDURE exec_ddl(p_sql VARCHAR2) IS
    BEGIN
        EXECUTE IMMEDIATE p_sql;
    END;
BEGIN
    exec_ddl(
        'CREATE OR REPLACE VIEW v_sim_scale_json AS ' ||
        'SELECT ' ||
        ' r.id AS roadmap_id,' ||
        ' r.doc_no,' ||
        ' JSON_OBJECT(' ||
        ' ''anchorYear'' VALUE s.anchor_year,' ||
        ' ''weekLabelFormat'' VALUE s.week_fmt,' ||
        ' ''scales'' VALUE (' ||
        ' SELECT JSON_ARRAYAGG(' ||
        ' JSON_OBJECT(' ||
        ' ''unit'' VALUE sr.unit,' ||
        ' ''step'' VALUE sr.step_val,' ||
        ' ''format'' VALUE sr.fmt_key' ||
        ' ) ORDER BY sr.sort_no RETURNING CLOB' ||
        ' ) FROM sim_scale_row sr WHERE sr.scale_id = s.id' ||
        ' ) RETURNING CLOB' ||
        ' ) AS scale_json' ||
        ' FROM sim_roadmap r' ||
        ' INNER JOIN sim_scale s ON s.roadmap_id = r.id'
    );
END;
