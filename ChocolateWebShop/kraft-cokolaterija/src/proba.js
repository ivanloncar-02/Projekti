const FetchExample = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // Prazan niz ovisnosti - pokreće se samo jednom
  return (
    <div>
      <h1>Fetch Example</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading</p>}
    </div>
  );
};
export default FetchExample;
