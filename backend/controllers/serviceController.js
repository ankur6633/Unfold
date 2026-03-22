import Service from "../models/Service.js";
import Item from "../models/Item.js";
import ServiceItem from "../models/ServiceItem.js";

// @desc    Get all services with their mapped items
// @route   GET /api/services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    const mappedServices = await Promise.all(
      services.map(async (service) => {
        const items = await ServiceItem.find({ serviceId: service._id, isActive: true })
          .populate("itemId");
        return {
          ...service._doc,
          items: items.map(si => si.itemId)
        };
      })
    );
    res.json(mappedServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN CONTROLLERS ---

// @desc    Create a new service
// @route   POST /api/admin/services
export const createService = async (req, res) => {
  const { name, priceType, basePrice, image, description } = req.body;
  try {
    const service = await Service.create({ name, priceType, basePrice, image, description });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a new item master
// @route   POST /api/admin/items
export const createItem = async (req, res) => {
  const { name, unitType } = req.body;
  try {
    const item = await Item.create({ name, unitType });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all items
// @route   GET /api/services/admin/items
export const getItems = async (req, res) => {
  try {
    const items = await Item.find({ isActive: true });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mappings
// @route   GET /api/services/admin/mappings
export const getMappings = async (req, res) => {
  try {
    const mappings = await ServiceItem.find({ isActive: true })
      .populate("serviceId")
      .populate("itemId");
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Map an item to a service
// @route   POST /api/admin/service-items
export const mapServiceItem = async (req, res) => {
  const { serviceId, itemId, priceOverride } = req.body;
  try {
    const mapping = await ServiceItem.create({ serviceId, itemId, priceOverride });
    res.status(201).json(mapping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/admin/services/:id
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, priceType, basePrice, image, description, isActive } = req.body;
  try {
    const service = await Service.findByIdAndUpdate(
      id,
      { name, priceType, basePrice, image, description, isActive },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/admin/services/:id
export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    // Also cleanup mappings
    await ServiceItem.deleteMany({ serviceId: id });
    
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
