import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";

import Dropzone from "../../components/Dropzone";

import "./styles.css";
import logo from "../../assets/logo.svg";

import api from "../../services/api";

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface IBGEUFResponde {
  sigla: string;
}

interface IBGECityResponde {
  nome: string;
}

const CreatePoint = () => {
  const history = useHistory();

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [citys, setCitys] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedUF, setSelectedUF] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedLatLon, setSelectedLatLon] = useState<[number, number]>([
    0,
    0,
  ]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then((res) => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponde[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((res) => {
        const ufInitials = res.data.map((uf) => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUF === "0") return;

    axios
      .get<IBGECityResponde[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((res) => {
        const cityNames = res.data.map((city) => city.nome);
        setCitys(cityNames);
      });
  }, [selectedUF]);

  const handleSelectUF = (ev: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUF(ev.target.value);
  };
  const handleSelectCity = (ev: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(ev.target.value);
  };

  const handleMapClick = (ev: LeafletMouseEvent) => {
    setSelectedLatLon([ev.latlng.lat, ev.latlng.lng]);
  };

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedLatLon;
    const items = selectedItems;

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("whatsapp", whatsapp);
    data.append("uf", uf);
    data.append("city", city);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("items", items.join(","));

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("points", data);

    alert("Ponto de coleta criado!");
    history.push("/");
  };

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do
          <br />
          ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              onChange={handleInputChange}
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                onChange={handleInputChange}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                onChange={handleInputChange}
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedLatLon} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                onChange={handleSelectUF}
                value={selectedUF}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf, index) => {
                  return (
                    <option key={index} value={uf}>
                      {uf}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                onChange={handleSelectCity}
                value={selectedCity}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {citys.map((city, index) => {
                  return (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ìtens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => {
              return (
                <li
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <img src={item.image_url} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
