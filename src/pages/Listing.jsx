import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../Firebase";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import { FaShare } from "react-icons/fa";
import { toast } from "react-toastify";
import { ImLocation2 } from "react-icons/im";
import { FaBed } from "react-icons/fa";
import { FaBath } from "react-icons/fa";
import { FaParking } from "react-icons/fa";
import { GiSofa } from "react-icons/gi";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [contactLandlord, setContactLandlord] = useState(false);
  const params = useParams();
  const auth = getAuth();
  const position = [34, 1];

  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    }
    fetchListing();
  }, [params.listingId, listing]);
  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls.map((url, id) => (
          <SwiperSlide key={id}>
            <div
              className="w-full overflow-hidden h-[400px]"
              style={{
                background: `url(${listing.imgUrls[id]}) center no-repeat`,backgroundSize:'cover'
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[13%] right-[4%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          toast.info("Link copied");

          setTimeout(() => {
            setShareLinkCopied(false);
          }, 1000);
        }}
      >
        <FaShare className="text-lg text-slate-500 " />
      </div>
      <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg bg-white lg:space-x-5 ">
        <div className=" w-full   lg:h-[400px] ">
          <p className="text-2xl font-bold mb-3 text-blue-800">
            {listing.name} - $
            {listing.offer ? listing.discountedPrice : listing.regularPrice}
            {listing.type === "rent" ? " /month" : ""}
          </p>
          <p className="flex items-center mt-4 mb-3 font-semibold">
            <ImLocation2 className="text-blue-600 mr-1" />
            {listing.address}
          </p>
          <div className="flex justify-start items-center space-x-4 w-[75%]">
            <p className="bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md ">
              {listing.type === "rent" ? "For Rent" : "For Sale"}
            </p>
            {listing.offer && (
              <p className="bg-green-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md ">
                {" "}
                $ {listing.regularPrice - listing.discountedPrice} discounted
              </p>
            )}
          </div>
          <p className="mt-3 mb-3">
            <span className="font-semibold">Description :</span>{" "}
            {listing.description}
          </p>
          <ul className="flex flex-wrap items-center   text-sm font-semibold">
            <li className="flex items-center whitespace-nowrap  mr-[6px] sm:mr-4 mb-1">
              <FaBed className="text-lg mr-1" />{" "}
              {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap mr-[6px] sm:mr-4 mb-1">
              <FaBath className="text-lg mr-1" />{" "}
              {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
            </li>
            <li className="flex items-center whitespace-nowrap mr-[6px] sm:mr-4 mb-1">
              <FaParking className="text-lg mr-1" />{" "}
              {listing.parking && "Parking Spot"}
            </li>
            <li className="flex items-center whitespace-nowrap mr-[6px] sm:mr-4 mb-1">
              <GiSofa className="text-lg mr-1" />
              {listing.furnished && "Furnished"}
            </li>
          </ul>
          {listing.userRef !== auth.currentUser?.uid && !contactLandlord && (
            <button
              onClick={() => {
                setContactLandlord(true);
              }}
              className="px-7 py-3  bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
            >
              Contact Landlord
            </button>
          )}
          {contactLandlord && (
            <Contact userRef={listing.userRef} listing={listing} />
          )}
        </div>
        <div className=" w-full h-[245px] md:h-[430px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
          <MapContainer
            center={[listing.latitude, listing.longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[listing.latitude, listing.longitude]}>
              <Popup>
                {listing.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
