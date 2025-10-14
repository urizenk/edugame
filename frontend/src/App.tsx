import PlaygroundPage from "./pages/PlaygroundPage";
import TestPanel from "./components/TestPanel";

const App = () => (
    <>
        <PlaygroundPage />
        {/* 开发环境显示测试面板 */}
        {import.meta.env.DEV && <TestPanel />}
    </>
);

export default App;
