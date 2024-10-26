import { useState } from "react";
import { useDispatch } from "react-redux";
import { createSpot } from "../../store/spots";

function CreateSpotPage() {
  const dispatch = useDispatch();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);



  const handleSubmit = (e) => {
    e.preventDefault();

    // Replace FormData with a regular JavaScript object
    const formData = {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    };

    dispatch(createSpot(formData));
  };


  return (
    <>
      <h1>add a new spot</h1>
      <form>
        <label>
          address
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <label>
          city
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label>
          state
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </label>
        <label>
          country
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </label>
        <label>
          lat
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            required
          />
        </label>
        <label>
          lng
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(Number(e.target.value))}
            required
          />
        </label>
        <label>
          name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label>
          price
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <label>
          submit
          <button type="submit" onClick={handleSubmit}>
            submit
          </button>
        </label>
      </form>
    </>
  );
}

export default CreateSpotPage;
