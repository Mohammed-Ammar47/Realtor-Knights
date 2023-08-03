import React, { useEffect, useState } from "react";
import Slider from "../components/Slider";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../Firebase";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";


export default function Home() {
  // offers
  const [offerListing, setOfferListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings')
        const q = query(listingRef, where('offer','==',true), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setOfferListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
  }, []);
  // places for rent
  const [rentListing, setRentListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings')
        const q = query(listingRef, where('type','==','rent'), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setRentListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
  }, []);

// places for sale
const [saleListing, setSaleListing] = useState(null)
useEffect(() => {
  async function fetchListings() {
    try {
      const listingRef = collection(db, 'listings')
      const q = query(listingRef, where('type','==','sale'), orderBy('timestamp', 'desc'), limit(4))
      const querySnap = await getDocs(q);
      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setSaleListing(listings)
    } catch (error) {
      console.log(error);
    }
  }
  fetchListings()
}, []);

  return <div>
    <Slider  />
    {offerListing && offerListing.length > 0 && 
    (<div className="mx-10 mt-2 mb-6">
    <h2 className="px-3 text-2xl mt-6 font-semibold">Recent offers</h2>
    <Link to='/offers'>
      <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"> Show more offers</p>
    </Link>
    <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  mt-6 mb-6">

    { offerListing.map((listing)=> (
      <ListingItem  key={listing.id} id={listing.id} listing={listing.data} />
    ))}
    </ul>
   </div>) 
     }
     {rentListing && rentListing.length > 0 && (<div className="mx-10 mt-2 mb-6">
    <h2 className="px-3 text-2xl mt-6 font-semibold">Places for rent</h2>
    <Link to='/category/rent'>
      <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">Show more places for rent</p>
    </Link>
    <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  mt-6 mb-6">

    { rentListing.map((listing)=> (
      <ListingItem  key={listing.id} id={listing.id} listing={listing.data} />
    ))}
    </ul>
   </div>)}

     {saleListing && saleListing.length > 0 && (<div className="mx-10 mt-2 mb-6">
    <h2 className="px-3 text-2xl mt-6 font-semibold">Places for sale</h2>
    <Link to='/category/sale'>
      <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">Show more places for sale</p>
    </Link>
    <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  mt-6 mb-6">

    { saleListing.map((listing)=> (
      <ListingItem  key={listing.id} id={listing.id} listing={listing.data} />
    ))}
    </ul>
   </div>)}
  </div>;
 }

 