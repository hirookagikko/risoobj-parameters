import P5GridControlPanel from '../components/P5GridControlPanel';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">P5.js Grid Control Panel</h1>
      <P5GridControlPanel />
    </div>
  );
}