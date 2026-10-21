import "@/app/globals.css";
import Image from "next/image";

import {badges} from "@/constant/badges.config";

export const Badge1Hover = () => {
  const badge1 = badges[0];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge1.image} alt={badge1.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge1.name}</h2>
        <p className="text-desc text-[14px]">{badge1.desc}</p>
      </div>
    </div>
  );
};


export const Badge2Hover = () => {
  const badge2 = badges[1];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge2.image} alt={badge2.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge2.name}</h2>
        <p className="text-desc text-[14px]">{badge2.desc}</p>
      </div>
    </div>
  );
};

export const Badge3Hover = () => {
  const badge3 = badges[2];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge3.image} alt={badge3.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge3.name}</h2>
        <p className="text-desc text-[14px]">{badge3.desc}</p>
      </div>
    </div>
  );
};

export const Badge4Hover = () => {
  const badge4 = badges[3];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge4.image} alt={badge4.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge4.name}</h2>
        <p className="text-desc text-[14px]">{badge4.desc}</p>
      </div>
    </div>
  );
};

export const Badge5Hover = () => {
  const badge5 = badges[4];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge5.image} alt={badge5.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge5.name}</h2>
        <p className="text-desc text-[14px]">{badge5.desc}</p>
      </div>
    </div>
  );
};

export const Badge6Hover = () => {
  const badge6 = badges[5];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge6.image} alt={badge6.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge6.name}</h2>
        <p className="text-desc text-[14px]">{badge6.desc}</p>
      </div>
    </div>
  );
};

export const Badge7Hover = () => {
  const badge3 = badges[6];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge3.image || "/images/Badges/default-badge.svg"} alt={badge3.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge3.name}</h2>
        <p className="text-desc text-[14px]">{badge3.desc}</p>
      </div>
    </div>
  );
};

export const Badge8Hover = () => {
  const badge3 = badges[7];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge3.image} alt={badge3.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge3.name}</h2>
        <p className="text-desc text-[14px]">{badge3.desc}</p>
      </div>
    </div>
  );
};


export const Badge9Hover = () => {
  const badge3 = badges[8];
  return (
    <div className="w-100 p-2 py-3 flex bg-[#EDF5FA] card-shadow rounded-2xl border border-[#18ABC6] border-dashed border-spacing-3">
      <Image src={badge3.image} alt={badge3.name} width={50} height={50} />
      <div className="ps-2 pt-1">
        <h2 className="text-[16px]">{badge3.name}</h2>
        <p className="text-desc text-[14px]">{badge3.desc}</p>
      </div>
    </div>
  );
};
