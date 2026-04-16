import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

// Import all your schemas
import product from "./schemas/product";
import banner from "./schemas/banner";
import product2 from "./schemas/product2";
import watch from "./schemas/watch";
import phoneacc from "./schemas/phoneacc";
import phones from "./schemas/phones";
import electronic from "./schemas/electronic";
import blogPost from "./schemas/blogPost";
import car from "./schemas/car";
import order from "./schemas/order";
import agritechPage from "./schemas/agritechPage";
import userCart from "./schemas/userCart";
import sharedWishlist from "./schemas/sharedWishlist";
import review from "./schemas/review";
import subscriber from "./schemas/subscriber";
import offgrid from "./schemas/offgrid";
import wholesaleSuzuki from "./schemas/wholesaleSuzuki";
import wholesaleFarming from "./schemas/wholesaleFarming";
import wholesaleElectronics from "./schemas/wholesaleElectronics";
import partsRequest from "./schemas/partsRequest";

export default defineConfig({
  name: "default",
  title: "RUGGTECH Sanity Studio",
  
  projectId: 'pb8lzqs5',
  dataset: 'production',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],
  
  schema: {
    types: [
      phones,
      phoneacc,
      watch,
      product,
      product2,
      electronic,
      banner,
      blogPost,
      car,
      order,
      agritechPage,
      userCart,
      sharedWishlist,
      review,
      subscriber,
      offgrid,
      wholesaleSuzuki,
      wholesaleFarming,
      wholesaleElectronics,
      partsRequest,
    ],
  },
});