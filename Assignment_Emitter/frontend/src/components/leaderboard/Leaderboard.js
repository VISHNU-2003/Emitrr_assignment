import React from "react";
import { useSelector } from "react-redux";

function Leaderboard() {
  const users = useSelector((state) => state.leaderBoard?.userScores);
  const myUserName = useSelector((state) => state.gameState?.userName);

  return (
    <div style={{ flex: 1 }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px" }}>Leaderboard</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #333", padding: "10px", textAlign: "left" }}>Rank</th>
            <th style={{ borderBottom: "2px solid #333", padding: "10px", textAlign: "left" }}>Username</th>
            <th style={{ borderBottom: "2px solid #333", padding: "10px", textAlign: "left" }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user, index) => {
              const { userName, userScore } = user;
              return (
                <tr key={userName} style={{ backgroundColor: myUserName === userName ? "#f0f0f0" : "" }}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{index + 1}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{userName}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{userScore}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
