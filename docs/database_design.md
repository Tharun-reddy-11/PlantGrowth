# Database design

`schema.sql` is MySQL Workbench compatible. It preserves raw observation timestamps and provenance, holds unavailable attributes as `NULL`, and indexes time-ordered joins. Prediction rows store their input snapshot, feature pipeline version, trained model version and model explanation so a historic output can be audited. Model binaries live in the ML artifact directory, not MySQL.
