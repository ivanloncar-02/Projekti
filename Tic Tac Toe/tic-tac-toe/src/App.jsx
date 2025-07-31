import TicTacToe from "./TicTacToe";
import 'bootstrap/dist/css/bootstrap.min.css';  

const App = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ height: '100vh' }}>
      <TicTacToe />
    </div>
  );
};

export default App;
