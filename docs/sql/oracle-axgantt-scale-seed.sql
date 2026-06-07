-- =============================================================================
-- AxGantt — Seed data (mock 2025–2028) với ID cố định kiểu Mendix
-- Chạy SAU khi đã CREATE TABLE (oracle-axgantt-scale.sql)
-- Nguồn: mock/axgantt-roadmap.mock.full.json
-- =============================================================================
--
-- QUY ƯỚC ID (NUMBER(20) — giống Mendix Long / id column)
-- Prefix 170607 = ngày seed 2026-06-07; dùng CÙNG id khi import Mendix hoặc
-- map association trong Studio (RoadmapScaleConfig_Roadmap, …).
--
-- ┌─────────────────────────┬─────────────────────┬──────────────────────────┐
-- │ Mendix entity           │ ID                  │ Ghi chú                  │
-- ├─────────────────────────┼─────────────────────┼──────────────────────────┤
-- │ ScaleTemplate           │ 170607000000001     │ code EXEC_YW             │
-- │ ScaleTemplateUnit       │ 170607000000002     │ tpl row sort_no=0 year   │
-- │ ScaleTemplateUnit       │ 170607000000003     │ tpl row sort_no=1 week   │
-- │ Roadmap                 │ 170607000000010     │ Msoc251030-155 rev 3     │
-- │ RoadmapScaleConfig      │ 170607000000011     │ scaleJson root           │
-- │ RoadmapScaleUnit        │ 170607000000012     │ scale row sort_no=0      │
-- │ RoadmapScaleUnit        │ 170607000000013     │ scale row sort_no=1      │
-- └─────────────────────────┴─────────────────────┴──────────────────────────┘
--
-- Mendix deploy table (tham khảo): pmroadmap$scaletemplate, pmroadmap$roadmap, …
-- Cột FK Mendix: pmroadmap$roadmapid, pmroadmap$roadmapscaleconfigid, …
-- =============================================================================

-- ─── (Optional) xóa seed cũ cùng id block ───────────────────────────────────
-- DELETE FROM pm_scale_row     WHERE id BETWEEN 170607000000012 AND 170607000000013;
-- DELETE FROM pm_scale         WHERE id = 170607000000011;
-- DELETE FROM pm_roadmap       WHERE id = 170607000000010;
-- DELETE FROM pm_scale_tpl_row WHERE id BETWEEN 170607000000002 AND 170607000000003;
-- DELETE FROM pm_scale_tpl     WHERE id = 170607000000001;
-- COMMIT;

-- ─── 1. pm_scale_tpl — preset Executive Year + Week ─────────────────────────

INSERT INTO pm_scale_tpl (
    id, code, name, anchor_year, week_fmt,
    is_default, is_active,
    created_at, updated_at
) VALUES (
    170607000000001,
    'EXEC_YW',
    'Executive Year + ISO Week',
    2026,
    'W##',
    1,
    1,
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2026-06-07 08:00:00'
);

-- ─── 2. pm_scale_tpl_row — 2 hàng preset (năm + tuần) ───────────────────────

INSERT INTO pm_scale_tpl_row (id, tpl_id, sort_no, unit, step_val, fmt_key)
VALUES (170607000000002, 170607000000001, 0, 'year', 1, 'year');

INSERT INTO pm_scale_tpl_row (id, tpl_id, sort_no, unit, step_val, fmt_key)
VALUES (170607000000003, 170607000000001, 1, 'week', 1, 'W##');

-- ─── 3. pm_roadmap — header + ganttStartDate / ganttEndDate ─────────────────

INSERT INTO pm_roadmap (
    id, doc_no, revision, revised_by, revised_at,
    gantt_start, gantt_end, is_active,
    created_at, updated_at
) VALUES (
    170607000000010,
    'Msoc251030-155',
    '3',
    'mxadmin',
    TIMESTAMP '2026-06-07 08:00:00',
    DATE '2025-01-01',
    DATE '2028-12-31',
    1,
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2026-06-07 08:00:00'
);

-- ─── 4. pm_scale — scaleJson root (anchorYear, weekLabelFormat) ─────────────

INSERT INTO pm_scale (
    id, roadmap_id, anchor_year, week_fmt,
    name, note, tpl_id,
    created_at, updated_at
) VALUES (
    170607000000011,
    170607000000010,
    2026,
    'W##',
    'Samsung DS 2025-2028 timeline',
    'Khớp mock scaleJson — anchorYear 2026, week W##, executive year+week',
    170607000000001,
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2026-06-07 08:00:00'
);

-- ─── 5. pm_scale_row — scaleJson.scales[] ───────────────────────────────────

INSERT INTO pm_scale_row (
    id, scale_id, sort_no, unit, step_val, fmt_key,
    created_at, updated_at
) VALUES (
    170607000000012,
    170607000000011,
    0,
    'year',
    1,
    'year',
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2026-06-07 08:00:00'
);

INSERT INTO pm_scale_row (
    id, scale_id, sort_no, unit, step_val, fmt_key,
    created_at, updated_at
) VALUES (
    170607000000013,
    170607000000011,
    1,
    'week',
    1,
    'W##',
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2026-06-07 08:00:00'
);

COMMIT;

-- ─── Cập nhật sequence (tránh trùng id khi insert thêm) ─────────────────────

DECLARE
    PROCEDURE reset_seq(p_seq VARCHAR2, p_start NUMBER) IS
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_seq;
        EXECUTE IMMEDIATE 'CREATE SEQUENCE ' || p_seq || ' START WITH ' || p_start || ' INCREMENT BY 1 NOCACHE';
    END;
BEGIN
    reset_seq('pm_scale_tpl_row_seq', 170607000000100);
    reset_seq('pm_scale_tpl_seq',     170607000000100);
    reset_seq('pm_scale_row_seq',     170607000000100);
    reset_seq('pm_scale_seq',         170607000000100);
    reset_seq('pm_roadmap_seq',       170607000000100);
END;
/

-- ─── Verify ──────────────────────────────────────────────────────────────────

SELECT id, code, name, anchor_year, week_fmt, is_default
FROM pm_scale_tpl
ORDER BY id;

SELECT id, tpl_id, sort_no, unit, step_val, fmt_key
FROM pm_scale_tpl_row
ORDER BY tpl_id, sort_no;

SELECT id, doc_no, revision, gantt_start, gantt_end
FROM pm_roadmap
ORDER BY id;

SELECT id, roadmap_id, anchor_year, week_fmt, name, tpl_id
FROM pm_scale
ORDER BY id;

SELECT id, scale_id, sort_no, unit, step_val, fmt_key
FROM pm_scale_row
ORDER BY scale_id, sort_no;

SELECT roadmap_id, doc_no, scale_json
FROM v_pm_scale_json
WHERE roadmap_id = 170607000000010;

-- Kết quả scale_json mong đợi:
-- {"anchorYear":2026,"weekLabelFormat":"W##","scales":[
--   {"unit":"year","step":1,"format":"year"},
--   {"unit":"week","step":1,"format":"W##"}]}

-- =============================================================================
-- INSERT cho bảng Mendix thật (uncomment + đổi tên schema nếu cần)
-- Cột system Mendix: thêm changeddate, createddate, … theo model thực tế
-- =============================================================================
/*
INSERT INTO pmroadmap$scaletemplate (
    id, code, name, anchoryear, weeklabelformat, isdefault, isactive
) VALUES (
    170607000000001, 'EXEC_YW', 'Executive Year + ISO Week', 2026, 'W##', 1, 1
);

INSERT INTO pmroadmap$scaletemplateunit (
    id, sortorder, unit, step, formatkey,
    pmroadmap$scaletemplateid
) VALUES (
    170607000000002, 0, 'Year', 1, 'year', 170607000000001
);

INSERT INTO pmroadmap$scaletemplateunit (
    id, sortorder, unit, step, formatkey,
    pmroadmap$scaletemplateid
) VALUES (
    170607000000003, 1, 'Week', 1, 'W##', 170607000000001
);

INSERT INTO pmroadmap$roadmap (
    id, documentno, revision, revisedby, revisedat,
    ganttstartdate, ganttenddate, isactive
) VALUES (
    170607000000010,
    'Msoc251030-155', '3', 'mxadmin',
    TIMESTAMP '2026-06-07 08:00:00',
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2028-12-31 23:59:59',
    1
);

INSERT INTO pmroadmap$roadmapscaleconfig (
    id, anchoryear, weeklabelformat, name,
    pmroadmap$roadmapid,
    pmroadmap$scaletemplateid
) VALUES (
    170607000000011, 2026, 'W##',
    'Samsung DS 2025-2028 timeline',
    170607000000010,
    170607000000001
);

INSERT INTO pmroadmap$roadmapscaleunit (
    id, sortorder, unit, step, formatkey,
    pmroadmap$roadmapscaleconfigid
) VALUES (
    170607000000012, 0, 'Year', 1, 'year', 170607000000011
);

INSERT INTO pmroadmap$roadmapscaleunit (
    id, sortorder, unit, step, formatkey,
    pmroadmap$roadmapscaleconfigid
) VALUES (
    170607000000013, 1, 'Week', 1, 'W##', 170607000000011
);

COMMIT;
*/
