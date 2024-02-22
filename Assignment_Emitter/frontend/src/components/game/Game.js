import { useSelector } from "react-redux";
import { useActions } from "../../hooks/useActions";

const Game = (props) => {
  const userName = useSelector((state) => state.gameState?.userName);
  const cards = useSelector((state) => state.gameState?.gameCards);
  const isPending = useSelector((state) => state.gameState?.isPending);
  const score = useSelector((state) => state.gameState?.score);
  const hasDefuseCard = useSelector((state) => state.gameState?.hasDefuseCard);
  const activeCard = useSelector((state) => state.gameState?.activeCard);
  const { putGameState } = useActions();
  let left = 0;
  let top = 0;

  const checkCard = () => {
    const obj = {
      userName: userName,
      activeCard: activeCard,
      hasDefuseCard: hasDefuseCard,
      isPending: isPending,
      gameCards: cards,
      score: score,
    };
    let openedCard = cards.pop();
    let isCompleted = true;
    obj.activeCard = openedCard;
    
    if (openedCard === "Defuse card 🙅‍♂️") obj.hasDefuseCard = true;
    else if (openedCard === "Shuffle card 🔀") {
      obj.gameCards = null;
      obj.hasDefuseCard = false;
      isCompleted = false;
    } else if (openedCard === "Exploding kitten card 💣") {
      isCompleted = false;
      if (!obj.hasDefuseCard) {
        confirmation();

        function confirmation() {
          if (
            window.confirm(
              `game over!, you lost the game!, your score is ${obj.score} \n Do you want to play new game`
            )
          ) {
            obj.gameCards = null;
          }
        }
      } else {
       
        obj.hasDefuseCard = false;
      }
    }

    if (
      isCompleted &&
      (obj.gameCards?.length === 0 || obj.gameCards === null)
    ) {
      obj.score = parseInt(obj.score) + 1;
      confirmation();
      function confirmation() {
        if (
          window.confirm(
            `You won the game!!!, your score is ${obj.score} \n Do you want to play new game`
          )
        ) {
          obj.gameCards = null;
        }
      }
    }
    // update the score on database
    putGameState(obj);
  };
  return (
    <div style={{ flex: 2, backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/007/852/996/original/cat-wallpaper-with-yellow-eyes-free-vector.jpg')", padding: "20px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}>
      <h1 style={{ textAlign: "center", color: "white" }}>🙀 Exploding Kitten</h1>
      {cards?.length > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <h3 style={{ color: "white" }}>Tap on the card</h3>
              <div
                style={{ position: "relative", top: "30px" }}
                onClick={checkCard}
              >
                {cards?.length !== 0 &&
                  cards?.map((card) => {
                    left = left + 10;
                    top = top + 10;
                    return (
                      <div>
                        <div
                          style={{
                            height: "100px",
                            width: "100px",
                            position: "absolute",
                            left: `${left}px`,
                            top: `${top}px`,
                            backgroundColor: "white",
                          }}
                        >
                          {card}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          {activeCard ? (
            <h1 style={{ marginTop: "300px", textAlign: "center", color: "white" }}>
              Active Card: {activeCard}
            </h1>
          ) : (
            <h1 style={{ marginTop: "300px", textAlign: "center", color: "white" }}>🐈🐈🐈</h1>
          )}
        </>
      ) : (
        <span style={{ color: "white", display: "flex", justifyContent: "center", alignItems: "center", height: "50px" }}>
  <div style={{ border: "5px solid #f3f3f3", borderTop: "5px solid #3498db", borderRadius: "50%", width: "20px", height: "20px", animation: "spin 2s linear infinite" }}></div>
  <span style={{ marginLeft: "10px" }}>Loading new game...</span>
</span>
      )}

      {score ? (
        <h1 style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
          score: {score}
        </h1>
      ) : (
        <h1 style={{ marginTop: "100px", textAlign: "center", color: "white" }}>score: 🐈🐈🐈</h1>
      )}
    </div>
  );
};

export default Game;
