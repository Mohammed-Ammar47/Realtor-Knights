import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../Firebase';
import { useParams } from 'react-router';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

export default function Category() {
const [listings, setListings ] = useState(null)
const [loading ,setLoading] = useState(true)
const [lastFetchedListing , setLastFetchedListing] = useState(null)
const params = useParams()

useEffect(() => {
  try {
    async function fetchListings() {
      const docRef = collection(db, 'listings')
      const q = query(docRef, where('type','==', params.categoryName) , orderBy('timestamp' , 'desc'), limit(4))
      const querySnap = await getDocs(q)
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)
      let listing = []
      querySnap.forEach((doc) =>{
        listing.push({id: doc.id , data: doc.data()})
      } )
      setListings(listing)
      setLoading(false)
    }
    fetchListings()
  } catch (error) {
    console.log(error);
  }
}, [params.categoryName]);
async function fetchMoreListings() {
  try {
    const listingRef = collection(db, "listings");
    const q = query(
      listingRef,
      where("type", "==", params.categoryName),
      orderBy("timestamp", "desc"),
      startAfter(lastFetchedListing),
      limit(4)
    );
    const querySnap = await getDocs(q);
    const lastVisible = querySnap.docs[querySnap.docs.length - 1];
    setLastFetchedListing(lastVisible);
    const listings = [];
    querySnap.forEach((doc) => {
      return listings.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    setListings((prevState)=>[...prevState, ...listings]);
    setLoading(false);
    } catch (error) {
      console.log(error);
    }
}

if (loading) {
  return <Spinner />
}
  return ( <>
    <div className="max-w-6xl mx-auto px-3">
    <h1 className="text-3xl text-center mt-6 font-bold ">Places for {params.categoryName}</h1>
    {listings.length > 0 ? 
     <div>
    <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 mb-6">
      {listings.map((listing)=> (
       <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
      ))}</ul>
      { lastFetchedListing && <div className="flex justify-center items-center"><button onClick={fetchMoreListings}  className="bg-white px-3 py-2 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out">show more</button></div> }
       </div> : <p>There are no places for rent</p>}
    </div>
  </>
  )
}
