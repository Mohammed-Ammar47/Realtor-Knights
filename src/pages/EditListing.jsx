import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useNavigate, useParams } from "react-router";

export default function EditListing() {
  const auth = getAuth();
  const navigate = useNavigate();
  // const [geoLocationEnable, setGeoLocationEnable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const [listings, setListings] = useState(null);

  const params = useParams();
  useEffect(() => {
    if (listings && listings.userRef !== auth.currentUser.uid) {
      toast.error("You can't edit this listing");
      navigate("/");
    }
  }, [auth.currentUser.uid, navigate, listings]);

  useEffect(() => {
    setLoading(true);
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListings(docSnap.data());
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing does not exist");
      }
    }
    fetchListing();
  }, [navigate, params.listingId]);

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData((prevState) => ({ ...prevState, images: e.target.files }));
    }
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (formData.discountedPrice > formData.regularPrice) {
      setLoading(false);
      toast.error("Discounted price < regular price");
      return;
    }
    if (formData.images.length > 6) {
      setLoading(false);
      toast.error("6 images max");
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapShot) => {
            const progress =
              (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
            console.log("upload is " + progress + "% done");
            switch (snapShot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
            console.log("upload failed");
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
              console.log("uploaded successfully");
            });
          }
        );
      });
    }

    const imgUrls = await Promise.all(
      [...formData.images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("images not uploaded");
      return;
    });
    console.log(imgUrls);
    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Listing Edited");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit the Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              formData.type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="type"
            value="sale"
          >
            sell{" "}
          </button>
          <button
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              formData.type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="type"
            value="rent"
          >
            rent{" "}
          </button>
        </div>

        {/* Name */}

        <p className="text-lg mt-6 font-semibold">Name </p>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Name"
          maxLength="32"
          minLength="10 "
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {/* bedrooms number */}
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold ">Beds</p>
            <input
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-700 rounded 
                transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              type="number"
              id="bedrooms"
              value={formData.bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
            />
          </div>
          {/* bathrooms number */}
          <div>
            <p className="text-lg font-semibold ">Baths</p>
            <input
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-700 rounded 
                transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              type="number"
              id="bathrooms"
              value={formData.bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
            />
          </div>
        </div>

        {/* PARKING SPOT */}

        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !formData.parking
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="parking"
            value={true}
          >
            Yes
          </button>
          <button
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              formData.parking
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="parking"
            value={false}
          >
            No{" "}
          </button>
        </div>

        {/* Furnished */}

        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex">
          <button
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !formData.furnished
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="furnished"
            value={true}
          >
            Yes
          </button>
          <button
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              formData.furnished
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="furnished"
            value={false}
          >
            No{" "}
          </button>
        </div>

        {/* address */}

        <p className="text-lg mt-6 font-semibold">Address </p>
        <textarea
          type="text"
          id="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />

        {/* latitude & longitude */}

        <div className="flex space-x-6 justify-start mb-6  ">
          <div>
            <p className="text-lg font-semibold">Latitude</p>
            <input
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center"
              type="number"
              id="latitude"
              min={-90}
              max={90}
              value={formData.latitude}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Longitude</p>
            <input
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center"
              type="number"
              id="longitude"
              min={-180}
              max={180}
              value={formData.longitude}
              onChange={onChange}
              required
            />
          </div>
        </div>

        {/* description */}

        <p className="text-lg  font-semibold">Description </p>
        <textarea
          type="text"
          id="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {/* offers */}
        <p className="text-lg  font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !formData.offer
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="offer"
            value={true}
          >
            Yes
          </button>
          <button
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              formData.offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
            onClick={onChange}
            type="button"
            id="offer"
            value={false}
          >
            No{" "}
          </button>
        </div>
        {/* regular price */}
        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold ">Regular price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded 
                transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                type="number"
                id="regularPrice"
                value={formData.regularPrice}
                onChange={onChange}
                min="50"
                max="400000000"
                required
              />
              {formData.type === "rent" && (
                <div>
                  <p className="text-md w-full whitespace-nowrap ">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* discounted price */}

        {formData.offer && (
          <div className="flex items-center mb-6">
            <div className="">
              <p className="text-lg font-semibold ">Discounted price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded 
                transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                  type="number"
                  id="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={formData.offer}
                />
                {formData.type === "rent" && (
                  <div>
                    <p className="text-md w-full whitespace-nowrap ">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* images */}

        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
          />
        </div>
        <button
          type="submit "
          className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus::shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out "
        >
          Edit Listing
        </button>
      </form>
    </main>
  );
}
