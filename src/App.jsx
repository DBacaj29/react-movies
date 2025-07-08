import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import MovieDetail from './components/MovieDetail.jsx';

const App = () => {
  return (
    <Routes>
      {/* Home page: contains search, trending, all movies */}
      <Route path="/" element={<Home />} />

      {/* Movie detail page by ID */}
      <Route path="/movie/:id" element={<MovieDetail />} />
    </Routes>
  );
};

export default App;
