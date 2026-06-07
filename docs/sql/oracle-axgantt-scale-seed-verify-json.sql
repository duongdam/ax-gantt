-- =============================================================================
-- AxGantt - Verify scaleJson view (ONE statement)
-- Run AFTER oracle-axgantt-scale-view.sql
-- =============================================================================

SELECT roadmap_id, doc_no, scale_json
FROM v_sim_scale_json
WHERE roadmap_id = 170607000000010
