-- =============================================================================
-- AxGantt — Oracle reference schema: scaleJson
-- Quy ước tên: pm_{entity} — ngắn, dễ đọc (PM Roadmap module)
-- Mendix entity map: xem docs/10-oracle-scale-domain.md
-- =============================================================================

-- ─── Sequences ───────────────────────────────────────────────────────────────

CREATE SEQUENCE pm_roadmap_seq       START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE pm_scale_seq         START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE pm_scale_row_seq     START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE pm_scale_tpl_seq     START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE pm_scale_tpl_row_seq START WITH 1 INCREMENT BY 1 NOCACHE;

-- ─── pm_roadmap — tài liệu roadmap + khoảng timeline ────────────────────────
-- Mendix: Roadmap | Widget: roadmapNo, ganttStartDate, ganttEndDate

CREATE TABLE pm_roadmap (
    id              NUMBER(20)    NOT NULL,
    doc_no          VARCHAR2(64)  NOT NULL,
    revision        VARCHAR2(16),
    revised_by      VARCHAR2(128),
    revised_at      TIMESTAMP,
    gantt_start     DATE          NOT NULL,
    gantt_end       DATE          NOT NULL,
    is_active       NUMBER(1)     DEFAULT 1 NOT NULL,
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_pm_roadmap PRIMARY KEY (id),
    CONSTRAINT uk_pm_roadmap_doc UNIQUE (doc_no, revision),
    CONSTRAINT ck_pm_roadmap_dates CHECK (gantt_end >= gantt_start),
    CONSTRAINT ck_pm_roadmap_active CHECK (is_active IN (0, 1))
);

CREATE INDEX ix_pm_roadmap_active ON pm_roadmap (is_active, gantt_start);

COMMENT ON TABLE pm_roadmap IS 'Roadmap header + timeline bounds (ganttStartDate/ganttEndDate)';
COMMENT ON COLUMN pm_roadmap.gantt_start IS 'Widget ganttStartDate';
COMMENT ON COLUMN pm_roadmap.gantt_end   IS 'Widget ganttEndDate';

-- ─── pm_scale — scaleJson root (1 roadmap : 1 scale) ────────────────────────
-- Mendix: RoadmapScaleConfig | JSON: anchorYear, weekLabelFormat

CREATE TABLE pm_scale (
    id              NUMBER(20)    NOT NULL,
    roadmap_id      NUMBER(20)    NOT NULL,
    anchor_year     NUMBER(4)     NOT NULL,
    week_fmt        VARCHAR2(8)   DEFAULT 'W##' NOT NULL,
    name            VARCHAR2(128),
    note            VARCHAR2(512),
    tpl_id          NUMBER(20),
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_pm_scale PRIMARY KEY (id),
    CONSTRAINT uk_pm_scale_roadmap UNIQUE (roadmap_id),
    CONSTRAINT fk_pm_scale_roadmap
        FOREIGN KEY (roadmap_id) REFERENCES pm_roadmap (id) ON DELETE CASCADE,
    CONSTRAINT ck_pm_scale_year CHECK (anchor_year BETWEEN 1970 AND 2100),
    CONSTRAINT ck_pm_scale_week_fmt CHECK (week_fmt IN ('W##', 'T##'))
);

COMMENT ON TABLE pm_scale IS 'scaleJson root — anchorYear + weekLabelFormat';
COMMENT ON COLUMN pm_scale.anchor_year IS 'Năm gốc ISO week (2026 = 53 tuần)';
COMMENT ON COLUMN pm_scale.week_fmt    IS 'W## → Tuần 01… | T## → T01…';

-- ─── pm_scale_row — scaleJson.scales[] (hàng header timeline) ───────────────
-- Mendix: RoadmapScaleUnit | sort_no: 0=năm, 1=tuần

CREATE TABLE pm_scale_row (
    id              NUMBER(20)    NOT NULL,
    scale_id        NUMBER(20)    NOT NULL,
    sort_no         NUMBER(5)     NOT NULL,
    unit            VARCHAR2(16)  NOT NULL,
    step_val        NUMBER(5)     DEFAULT 1 NOT NULL,
    fmt_key         VARCHAR2(32)  NOT NULL,
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_pm_scale_row PRIMARY KEY (id),
    CONSTRAINT uk_pm_scale_row_order UNIQUE (scale_id, sort_no),
    CONSTRAINT fk_pm_scale_row_scale
        FOREIGN KEY (scale_id) REFERENCES pm_scale (id) ON DELETE CASCADE,
    CONSTRAINT ck_pm_scale_row_sort CHECK (sort_no >= 0),
    CONSTRAINT ck_pm_scale_row_step CHECK (step_val >= 1),
    CONSTRAINT ck_pm_scale_row_unit
        CHECK (unit IN ('year', 'month', 'week', 'day')),
    CONSTRAINT ck_pm_scale_row_fmt
        CHECK (
            (unit = 'year'   AND fmt_key IN ('year', 'YYYY'))
            OR (unit = 'week'  AND fmt_key IN ('W##', 'T##'))
            OR (unit = 'month' AND fmt_key IN ('month', 'MMM YYYY', 'MM/YYYY'))
            OR (unit = 'day'   AND fmt_key IN ('day', 'dd MMM', 'DD/MM'))
        )
);

CREATE INDEX ix_pm_scale_row_scale ON pm_scale_row (scale_id, sort_no);

COMMENT ON TABLE pm_scale_row IS 'scaleJson.scales[] — mỗi row = 1 hàng header (sort_no 0=trên)';
COMMENT ON COLUMN pm_scale_row.fmt_key IS 'Khớp widget ScaleUnit.format';

-- ─── pm_scale_tpl — preset scale (optional) ───────────────────────────────────
-- Mendix: ScaleTemplate

CREATE TABLE pm_scale_tpl (
    id              NUMBER(20)    NOT NULL,
    code            VARCHAR2(32)  NOT NULL,
    name            VARCHAR2(128) NOT NULL,
    anchor_year     NUMBER(4)     NOT NULL,
    week_fmt        VARCHAR2(8)   DEFAULT 'W##' NOT NULL,
    is_default      NUMBER(1)     DEFAULT 0 NOT NULL,
    is_active       NUMBER(1)     DEFAULT 1 NOT NULL,
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_pm_scale_tpl PRIMARY KEY (id),
    CONSTRAINT uk_pm_scale_tpl_code UNIQUE (code),
    CONSTRAINT ck_pm_scale_tpl_year CHECK (anchor_year BETWEEN 1970 AND 2100),
    CONSTRAINT ck_pm_scale_tpl_week_fmt CHECK (week_fmt IN ('W##', 'T##')),
    CONSTRAINT ck_pm_scale_tpl_default CHECK (is_default IN (0, 1)),
    CONSTRAINT ck_pm_scale_tpl_active CHECK (is_active IN (0, 1))
);

-- ─── pm_scale_tpl_row — dòng preset ─────────────────────────────────────────
-- Mendix: ScaleTemplateUnit

CREATE TABLE pm_scale_tpl_row (
    id              NUMBER(20)    NOT NULL,
    tpl_id          NUMBER(20)    NOT NULL,
    sort_no         NUMBER(5)     NOT NULL,
    unit            VARCHAR2(16)  NOT NULL,
    step_val        NUMBER(5)     DEFAULT 1 NOT NULL,
    fmt_key         VARCHAR2(32)  NOT NULL,
    CONSTRAINT pk_pm_scale_tpl_row PRIMARY KEY (id),
    CONSTRAINT uk_pm_scale_tpl_row_order UNIQUE (tpl_id, sort_no),
    CONSTRAINT fk_pm_scale_tpl_row_tpl
        FOREIGN KEY (tpl_id) REFERENCES pm_scale_tpl (id) ON DELETE CASCADE,
    CONSTRAINT ck_pm_scale_tpl_row_sort CHECK (sort_no >= 0),
    CONSTRAINT ck_pm_scale_tpl_row_step CHECK (step_val >= 1),
    CONSTRAINT ck_pm_scale_tpl_row_unit
        CHECK (unit IN ('year', 'month', 'week', 'day'))
);

ALTER TABLE pm_scale ADD CONSTRAINT fk_pm_scale_tpl
    FOREIGN KEY (tpl_id) REFERENCES pm_scale_tpl (id);

-- ─── View: scaleJson ─────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_pm_scale_json AS
SELECT
    r.id        AS roadmap_id,
    r.doc_no,
    JSON_OBJECT(
        'anchorYear'      VALUE s.anchor_year,
        'weekLabelFormat' VALUE s.week_fmt,
        'scales'          VALUE (
            SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'unit'   VALUE sr.unit,
                           'step'   VALUE sr.step_val,
                           'format' VALUE sr.fmt_key
                       )
                       ORDER BY sr.sort_no
                       RETURNING CLOB
                   )
            FROM pm_scale_row sr
            WHERE sr.scale_id = s.id
        )
        RETURNING CLOB
    ) AS scale_json
FROM pm_roadmap r
JOIN pm_scale s ON s.roadmap_id = r.id;

-- ─── Seed data ───────────────────────────────────────────────────────────────
-- Dùng file riêng (ID cố định kiểu Mendix, mock đầy đủ):
--   @oracle-axgantt-scale-seed.sql
-- hoặc: sqlplus user/pass @docs/sql/oracle-axgantt-scale-seed.sql
