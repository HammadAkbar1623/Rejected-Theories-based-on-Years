import { useState, useEffect } from 'react';
import axios from 'axios';
import Aos from 'aos';
import 'aos/dist/aos.css'; 
import './App.css';

const RejectedTheories = () => {
  const [year, setYear] = useState('');
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Aos.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    Aos.refresh();
  }, []);

  const fetchTheories = async () => {
    setLoading(true);
    setError('');

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=outdated%20or%20discredited%20scientific%20theories%20before%20${year}&format=json&origin=*&srlimit=20`;

    try {
      const response = await axios.get(searchUrl);
      const result = response.data?.query?.search || [];

      const detailedTheories = await Promise.all(
        result.map(async (theory) => {
          const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&exchars=1000&pageids=${theory.pageid}&format=json&origin=*`;
          const pageResponse = await axios.get(pageUrl);
          const pageContent = pageResponse.data?.query?.pages?.[theory.pageid]?.extract || 'Content not available';
          return { title: theory.title, content: pageContent, link: `https://en.wikipedia.org/?curid=${theory.pageid}` };
        })
      );

      setTheories(detailedTheories);

      if (detailedTheories.length === 0) {
        setError("No relevant theories found. Try a different query.");
      }
    } catch (err) {
      setError("Failed to retrieve data from Wikipedia.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year || year < 0) {
      setError("Please enter a valid year.");
      return;
    }
    if (year > new Date().getFullYear()) {
      setError("Please enter a valid year.");
      return;
    }
    fetchTheories();
  };

  return (
    <>
      <div className="container flex justify-center items-center flex-col">
        <div className='font-bold text-center pt-10 pb-10 text-4xl'>
          <h1 className='text-3xl text-white font-semibold text-center font-serif sm:text-4xl'>
            Rejected Scientific Theories
          </h1>
        </div>
        <div className='flex justify-center items-center'>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <input
              className='border-2 border-gray-400 w-[300px] text-center'
              type="number"
              placeholder="Enter Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <button
              className='border border-gray-300 w-[80px] font-serif bg-gray-400 text-black hover:bg-slate-500'
              type="submit"
            >
              Fetch
            </button>
          </form>
        </div>

        {loading && <p className='text-white font-semibold text-center pt-4'>Loading...</p>}
        {error && <p className='text-white font-semibold text-center pt-4'>{error}</p>}

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10'>
          {theories.length > 0 ? (
            theories.map((theory, index) => (
              <div key={index} className='border border-white p-10 bg-gray-800 flex flex-col justify-between min-h-[150px] max-h-[300px]'>
                <div data-aos="fade-up" data-aos-delay="300">
                  <h3 className='font-bold text-white text-2xl text-center pb-4'>{theory.title}</h3>
                  <p className='text-white overflow-y-auto max-h-[150px]'>{theory.content}</p>
                  <a
                    className='text-blue-500 hover:text-blue-400 mt-2'
                    rel="noopener noreferrer"
                    href={theory.link}
                    target='_blank'
                  >
                    Read More
                  </a>
                </div>
              </div>

            ))
          ) : (
            !loading && !error && year && (
              <p className='text-white font-semibold text-center pt-4'>No theories found.</p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default RejectedTheories;
