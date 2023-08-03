import React from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { ImLocation2 } from "react-icons/im";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function ListingItem({ listing, id, onDelete, onEdit }) {
  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
      <Link className="contents" to={`/category/${listing.type}/${id}`}>
        <img
          className="h-[200px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in "
          src={listing.imgUrls[0]}
          loading="lazy"
          alt="house"
        />

        <Moment
          className="absolute top-2 left-2 bg-blue-600 text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
          fromNow
        >
          {listing.timestamp?.toDate()}
        </Moment>
        <div className="w-full p-[10px]">
          <div className="flex items-center space-x-1">
            <ImLocation2 className="h-4 w-4 text-blue-600" />
            <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate">
              {listing.address}
            </p>
          </div>
          <p className="font-semibold m-0 text-xl truncate">{listing.name}</p>
          <p className="text-blue-500 mt-2 font-semibold">
            ${listing.offer ? listing.discountedPrice : listing.regularPrice}{" "}
            {listing.type === "rent" && "/ Month"}
          </p>
          <div className="flex items-center mt-[10px] space-x-3">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bedrooms > 1 ? listing.bedrooms + "Beds" : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bathrooms > 1 ? listing.bathrooms + "Baths" : "1 Bath"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      {onDelete && (
        <FaTrash
          className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-blue-500  hover:text-blue-800 hover:shadow-lg "
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <MdEdit
          className="absolute bottom-1 right-8 h-[22px] cursor-pointer text-blue-500  hover:text-blue-800 hover:shadow-lg "
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
}
