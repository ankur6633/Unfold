import Product from "../models/Product.js";

function assertNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

async function uploadImageToCloudinary(fileBuffer, fileName) {
  const { default: cloudinary } = await import("../config/cloudinary.js");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "laundry-products",
        resource_type: "image",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.on("error", (err) => reject(err));
    stream.end(fileBuffer);
  });
}

export async function createProduct(req, res) {
  try {
    const { name, price } = req.body ?? {};
    const imageFile = req.file;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Product name is required." });
    }

    const parsedPrice = assertNumber(price);
    if (parsedPrice === null) {
      return res.status(400).json({ message: "Valid product price is required." });
    }

    if (!imageFile?.buffer) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      imageFile.originalname
    );

    if (!uploadResult?.secure_url) {
      return res.status(500).json({ message: "Image upload failed." });
    }

    const product = await Product.create({
      name: name.trim(),
      price: parsedPrice,
      image: uploadResult.secure_url,
    });

    return res.status(201).json(product);
  } catch (err) {
    try {
      const fs = await import('fs');
      fs.appendFileSync('error.log', `[${new Date().toISOString()}] Product Creation Error: ${err.stack}\n`);
    } catch (e) {
      console.error("Failed to write to error.log", e);
    }
    return res.status(500).json({ message: err?.message || "Internal server error." });
  }
}

export async function getProducts(_req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load products." });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params ?? {};
    if (!id) return res.status(400).json({ message: "Product id is required." });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found." });

    return res.status(200).json({ message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product." });
  }
}

