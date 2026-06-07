-- =============================================================================
-- AxGantt - Verify seed rows (ONE statement - DBeaver Alt+X or Ctrl+Enter)
-- Run AFTER oracle-axgantt-scale-seed.sql
-- JSON view check: oracle-axgantt-scale-seed-verify-json.sql
-- =============================================================================

SELECT
    r.id         AS roadmap_id,
    r.doc_no,
    r.gantt_start,
    r.gantt_end,
    s.id         AS scale_id,
    s.anchor_year,
    s.week_fmt,
    sr.sort_no,
    sr.unit,
    sr.step_val,
    sr.fmt_key
FROM sim_roadmap r
INNER JOIN sim_scale s ON s.roadmap_id = r.id
INNER JOIN sim_scale_row sr ON sr.scale_id = s.id
WHERE r.id = 170607000000010
ORDER BY sr.sort_no
