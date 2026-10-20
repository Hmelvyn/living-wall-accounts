import { useState } from "react";

export default function WallForm({ initialValue, editing, onSubmit, onCancel }) {
  const [wall, setWall] = useState(initialValue);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setWall({ ...wall, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSubmit({
        ...wall,
        widthMetres: Number(wall.widthMetres),
        heightMetres: Number(wall.heightMetres),
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="wall-form" onSubmit={handleSubmit}>
      {!editing && (
        <>
          <label>
            Building name
            <input
              name="buildingName"
              value={wall.buildingName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Building address
            <input
              name="buildingAddress"
              value={wall.buildingAddress}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Wall location
            <input
              name="wallLocation"
              value={wall.wallLocation}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Installed date
            <input
              type="date"
              name="installedDate"
              value={wall.installedDate}
              onChange={handleChange}
              required
            />
          </label>
        </>
      )}
      <label>
        Width (metres)
        <input
          type="number"
          min="0.01"
          step="0.01"
          name="widthMetres"
          value={wall.widthMetres}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Height (metres)
        <input
          type="number"
          min="0.01"
          step="0.01"
          name="heightMetres"
          value={wall.heightMetres}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Status
        <select name="status" value={wall.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-buttons">
        <button disabled={saving} type="submit">
          {saving ? "Saving..." : editing ? "Save changes" : "Add wall"}
        </button>
        <button disabled={saving} onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}
