// src/components/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function HomePage() {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/elections")
      .then((res) => setElections(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Elections</h1>
      {elections.length === 0 ? (
        <p>No elections available.</p>
      ) : (
        <ul>
          {elections.map((election) => (
            <li key={election.id}>
              <Link to={`/election/${election.id}`}>{election.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
