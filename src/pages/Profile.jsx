import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../Firebase";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcHome } from "react-icons/fc";
import ListingItem from "../components/ListingItem";
import { toast } from "react-toastify";

export default function Profile() {
  const auth = getAuth();
  const [formData, setFormData] = useState({
    fullName: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changeDetail, setChangeDetail] = useState(false);
  const navigate = useNavigate();
  function logOut() {
    auth.signOut();
    navigate("/");
  }
  const { fullName, email } = formData;
  console.log(email);

  function onChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }
  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== formData.fullName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.fullName,
        });
        await updateDoc(doc(db, "users", auth.currentUser.uid), { fullName });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchUserListings() {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({ id: doc.id, data: doc.data() });
      });
      setListings(listings);
      setLoading(false);
    }
    fetchUserListings();
  }, [auth.currentUser.uid]);
  async function onDelete(listingId) {
    if (window.confirm("are you sure you want to delete")) {
      await deleteDoc(doc(db, "listings", listingId));
      const updatedListing = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListing);
      toast.success("listing deleted");
    }
  }
  function onEdit(listingId) {
    navigate(`/edit-listing/${listingId}`);
  }
  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            <input
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
              onChange={onChange}
              type="text"
              id="fullName"
              value={formData.fullName}
              disabled={!changeDetail}
            />
            <input
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
              type="email"
              id="email"
              value={formData.email}
            />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-red-600">
                Do you want to change your info?
                <span
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                  className="text-red-600 hover:text-red-800 transition ease-in-out duration-200 ml-1 cursor-pointer "
                >
                  {changeDetail ? "Apply" : "Edit"}
                </span>
              </p>
              <p
                onClick={logOut}
                className="text-blue-600 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer "
              >
                Sign out
              </p>
            </div>
          </form>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
          >
            <Link
              to="/create-listing"
              className="flex justify-center items-center"
            >
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mb-6">
              My Listings
            </h2>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 mb-6">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
