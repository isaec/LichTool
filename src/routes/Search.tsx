import Omnisearch from "@src/components/Omnisearch";

const Search = () => {
  return (
    <div>
      <Omnisearch Result={(props) => <p>{props.id}</p>} />
    </div>
  );
};

export default Search;
