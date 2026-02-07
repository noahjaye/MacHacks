import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Upload } from './pages/Upload';
import { Analysis } from './pages/Analysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/analysis/:uploadId" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;
