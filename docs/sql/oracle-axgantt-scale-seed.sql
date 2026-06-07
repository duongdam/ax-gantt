-- =============================================================================
-- AxGantt - Seed data (Oracle 19c) - Simulator module / sim_* tables
-- Run AFTER oracle-axgantt-scale.sql (DBeaver Alt+X on THIS FILE ONLY)
-- Verify: oracle-axgantt-scale-seed-verify.sql (separate file - do not merge)
-- =============================================================================

DECLARE
    c_ts CONSTANT TIMESTAMP(6) :=
        TO_TIMESTAMP('2026-06-07 08:00:00', 'YYYY-MM-DD HH24:MI:SS');
    c_w_fmt CONSTANT VARCHAR2(8) := 'W' || CHR(35) || CHR(35);

    PROCEDURE reset_seq(p_name VARCHAR2, p_start NUMBER) IS
    BEGIN
        BEGIN
            EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_name;
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE != -2289 THEN
                    RAISE;
                END IF;
        END;
        EXECUTE IMMEDIATE
            'CREATE SEQUENCE ' || p_name ||
            ' START WITH ' || p_start ||
            ' INCREMENT BY 1 NOCACHE NOCYCLE';
    END;
BEGIN
    DELETE FROM sim_scale_row;
    DELETE FROM sim_scale;
    DELETE FROM sim_roadmap;
    DELETE FROM sim_scale_tpl_row;
    DELETE FROM sim_scale_tpl;

    INSERT INTO sim_scale_tpl (
        id, code, display_name, anchor_year, week_fmt,
        is_default, is_active, created_at, updated_at
    ) VALUES (
        170607000000001,
        'EXEC_YW',
        'Executive Year + ISO Week',
        2026,
        c_w_fmt,
        1,
        1,
        c_ts,
        c_ts
    );

    INSERT INTO sim_scale_tpl_row (id, tpl_id, sort_no, unit, step_val, fmt_key)
    VALUES (170607000000002, 170607000000001, 0, 'year', 1, 'year');

    INSERT INTO sim_scale_tpl_row (id, tpl_id, sort_no, unit, step_val, fmt_key)
    VALUES (170607000000003, 170607000000001, 1, 'week', 1, c_w_fmt);

    INSERT INTO sim_roadmap (
        id, doc_no, revision, revised_by, revised_at,
        gantt_start, gantt_end, is_active, created_at, updated_at
    ) VALUES (
        170607000000010,
        'Msoc251030-155',
        '3',
        'mxadmin',
        c_ts,
        DATE '2025-01-01',
        DATE '2028-12-31',
        1,
        c_ts,
        c_ts
    );

    INSERT INTO sim_scale (
        id, roadmap_id, anchor_year, week_fmt,
        display_name, note, tpl_id, created_at, updated_at
    ) VALUES (
        170607000000011,
        170607000000010,
        2026,
        c_w_fmt,
        'Samsung DS 2025-2028 timeline',
        'Mock scaleJson anchorYear 2026 ISO week format',
        170607000000001,
        c_ts,
        c_ts
    );

    INSERT INTO sim_scale_row (
        id, scale_id, sort_no, unit, step_val, fmt_key, created_at, updated_at
    ) VALUES (
        170607000000012,
        170607000000011,
        0,
        'year',
        1,
        'year',
        c_ts,
        c_ts
    );

    INSERT INTO sim_scale_row (
        id, scale_id, sort_no, unit, step_val, fmt_key, created_at, updated_at
    ) VALUES (
        170607000000013,
        170607000000011,
        1,
        'week',
        1,
        c_w_fmt,
        c_ts,
        c_ts
    );

    reset_seq('sim_scale_tpl_row_seq', 170607000000100);
    reset_seq('sim_scale_tpl_seq', 170607000000100);
    reset_seq('sim_scale_row_seq', 170607000000100);
    reset_seq('sim_scale_seq', 170607000000100);
    reset_seq('sim_roadmap_seq', 170607000000100);

    COMMIT;
END;
