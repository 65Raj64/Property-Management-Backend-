const express = require("express");
const multer = require("multer");
const Property = require("../models/Proerty");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description, propertyType } = req.body;

    // Construct URLs for the uploaded files
    const images = req.files.map((file) => {
      // Assuming your server is running on localhost:5000
      const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;
      return fullUrl;
    });

    // Create the property document
    const property = new Property({
      name,
      location,
      price,
      description,
      propertyType,
      images,
    });

    // Save the property to the database
    await property.save();

    // Return the saved property including the full image URLs
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a property
// router.put("/:id", upload.array("images", 5), async (req, res) => {
//   try {
//     const { name, location, price, description, propertyType } = req.body;
//     const newImages = req.files.map(
//       (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
//     );

//     const updatedData = {
//       name,
//       location,
//       price,
//       description,
//       propertyType,
//     };

//     // If new images are uploaded, update the images field
//     if (newImages.length > 0) {
//       updatedData.images = newImages;
//     }

//     const property = await Property.findByIdAndUpdate(
//       req.params.id,
//       updatedData,
//       {
//         new: true,
//       }
//     );

//     res.status(200).json(property);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating property", error });
//   }
// });
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description, propertyType } = req.body;

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => {
        return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      });
    }

    const updatedData = {
      name,
      location,
      price,
      description,
      propertyType,
    };

    if (newImages.length > 0) {
      updatedData.images = newImages;
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.name = name || property.name;
    property.location = location || property.location;
    property.price = price || property.price;
    property.description = description || property.description;
    property.propertyType = propertyType || property.propertyType;

    if (newImages.length > 0) {
      property.images = newImages;
    }

    const updatedProperty = await property.save();

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: "Error updating property", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, propertyType } = req.query;
    const filters = {};
    if (location) filters.location = location;
    if (minPrice && maxPrice)
      filters.price = { $gte: minPrice, $lte: maxPrice };
    if (propertyType) filters.propertyType = propertyType;

    const properties = await Property.find(filters);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, location, price, description, propertyType } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : undefined;

    const updatedData = { name, location, price, description, propertyType };
    if (images) updatedData.images = images;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property", error });
  }
});

module.exports = router;
