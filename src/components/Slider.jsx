import React, { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../Firebase";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import "swiper/css/bundle";
import { useNavigate } from 'react-router';

export default function Slider() {
  const [listings, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchListings ()  {
      const listingsRef = collection(db , 'listings')
      const q =  query(listingsRef,orderBy('timestamp', 'desc'), limit(5))
      const querySnap = await getDocs(q)
      let listings = []
      querySnap.forEach((doc)=>{
      return  listings.push({id:doc.id,data:doc.data(),})
      }) 
      setListing(listings)
      setLoading(false)
    };
    fetchListings()
  }, []);
  if (loading) {
    return <Spinner />
  }

  return (
    <Swiper
    slidesPerView={1}
    navigation
    pagination={{ type: "progressbar" }}
    effect="fade"
    modules={[EffectFade, Autoplay, Navigation, Pagination]}
    autoplay={{ delay: 3000 }}
  >
    {listings.map((listing) => (
      <SwiperSlide key={listing.id} onClick={() => {navigate(`/category/${listing.data.type}/${listing.id}`)}}>
        <div
        id={listing.data.type}
          className="relative w-full overflow-hidden h-[400px]"
          
          style={{
            background: `url(${listing.data.imgUrls[0]}) center no-repeat`, backgroundSize:'cover'
          }}
        ></div>
        <p className='text-white absolute left-1 top-3 font-medium max-w-[90%] bg-blue-500 shadow-lg opacity-90 p-2 rounded-br-3xl '> {listing.data.name} </p>
        <p className='text-white absolute left-1 bottom-3 font-medium max-w-[90%] bg-red-500 shadow-lg opacity-90 p-2 rounded-tr-3xl '> ${listing.data.discountedPrice ?? listing.data.regularPrice } 
        {listing.data.type === 'rent' && ' /month' }
        </p>

      </SwiperSlide>
    ))}
  </Swiper>
    
    
  
  
  )
}
