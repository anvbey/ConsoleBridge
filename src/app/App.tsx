import "../styles/App.css";
import { UploadPage } from "../features/upload/UploadPage";

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Console Session Translator</h1>
      </header>
      <main className="app-main">
        <UploadPage />
      </main>
    </div>
  );
}

export default App;
