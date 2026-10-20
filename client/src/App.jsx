import { useEffect, useState } from "react";
import WallForm from "./WallForm.jsx";
import {
  createLivingWall,
  getLivingWalls,
  updateLivingWall,
} from "./livingWallsApi.js";
import "./App.css";

const newWall = () => ({
  buildingName: "",
  buildingAddress: "",
  wallLocation: "",
  widthMetres: "",
  heightMetres: "",
  installedDate: new Date().toISOString().slice(0, 10),
  status: "active",
});

function App() {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadWalls() {
    setLoading(true);
    setLoadError("");
    try {
      setWalls(await getLivingWalls());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    getLivingWalls()
      .then((records) => {
        if (isCurrent) setWalls(records);
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function addWall(wall) {
    await createLivingWall(wall);
    setFormOpen(false);
    setMessage("Wall added.");
    await loadWalls();
  }

  async function editWall(id, changes) {
    await updateLivingWall(id, changes);
    setEditingId(null);
    setMessage("Wall updated.");
    await loadWalls();
  }

  return (
    <main className="page">
      <h1>Living Walls</h1>
      <p>View and update the living walls registered in the database.</p>

      <button
        onClick={() => {
          setFormOpen(!formOpen);
          setEditingId(null);
          setMessage("");
        }}
        type="button"
      >
        {formOpen ? "Close form" : "Add a living wall"}
      </button>

      {formOpen && (
        <section className="form-section">
          <h2>New living wall</h2>
          <WallForm
            initialValue={newWall()}
            onCancel={() => setFormOpen(false)}
            onSubmit={addWall}
          />
        </section>
      )}

      {message && <p role="status">{message}</p>}

      <section>
        <div className="list-heading">
          <h2>Registered living walls</h2>
          <button onClick={loadWalls} type="button">Refresh</button>
        </div>
        {loading && <p>Loading...</p>}
        {loadError && (
          <p className="error" role="alert">
            Could not load living walls: {loadError}
          </p>
        )}
        {!loading && !loadError && walls.length === 0 && (
          <p>No living walls have been added yet.</p>
        )}
        {!loading && !loadError && walls.length > 0 && (
          <div className="wall-list">
            {walls.map((wall) => (
              <article className="wall" key={wall.id}>
                <div className="wall-heading">
                  <div>
                    <h3>{wall.buildingName}</h3>
                    <p>{wall.buildingAddress}</p>
                    <p>Location: {wall.wallLocation}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(editingId === wall.id ? null : wall.id);
                      setFormOpen(false);
                    }}
                    type="button"
                  >
                    {editingId === wall.id ? "Close edit" : "Edit"}
                  </button>
                </div>
                <p>
                  Size: {wall.widthMetres} m × {wall.heightMetres} m
                </p>
                <p>Status: {wall.status}</p>
                {editingId === wall.id && (
                  <WallForm
                    editing
                    initialValue={{
                      widthMetres: String(wall.widthMetres),
                      heightMetres: String(wall.heightMetres),
                      status: wall.status,
                    }}
                    onCancel={() => setEditingId(null)}
                    onSubmit={(changes) => editWall(wall.id, changes)}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
