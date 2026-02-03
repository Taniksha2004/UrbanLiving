import { Request, Response } from 'express';
import { Service } from '../models/service.model'; // Make sure this is the default export

export const createService = async (req: Request, res: Response) => {
  try {
    // 1. Ensure a user is authenticated (vendor)
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { body, files } = req;
    
    // 2. Process uploaded image files from multer
    const imageFiles = files as Express.Multer.File[];
    const imagePaths = imageFiles ? imageFiles.map(file => `/uploads/${file.filename}`) : [];

    // 3. Construct the service data object from the form body
    const serviceData = {
      vendorId: req.user.userId,
      name: body.name,
      description: body.description,
      category: body.category,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      serviceArea: body.serviceArea,
      location: body.location,
      price: body.price ? Number(body.price) : undefined,
      priceRange: body.priceRange,
      priceType: body.priceType,
      minimumOrder: body.minimumOrder,
      deliveryCharges: body.deliveryCharges,
      specialties: body.specialties ? JSON.parse(body.specialties) : [],
      timing: body.timing ? JSON.parse(body.timing) : {},
      images: imagePaths,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      whatsapp: body.whatsapp,
      features: body.features ? JSON.parse(body.features) : [],
      policies: body.policies,
      contact: body.contact,
    };

    const newService = new Service(serviceData);
    await newService.save();

    res.status(201).json({ message: 'Service created successfully!', service: newService });

  } catch (error) {
    console.error('---!!! CREATE SERVICE FAILED !!!---', error);
    res.status(500).json({ 
      message: 'Server error while creating service.',
      error: (error as Error).message 
    });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    // Send back the data in a structured object for consistency
    res.status(200).json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error while fetching services.' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { userId } = req.user;

    // Find and delete the service ONLY if the logged-in user is the vendor who created it
    const service = await Service.findOneAndDelete({ _id: id, vendorId: userId });

    if (!service) {
      return res.status(404).json({ message: 'Service not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Service deleted successfully.' });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};
export const updateService = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { userId } = req.user;
    const { body, files } = req;

    // Find the service to ensure the user owns it
    const service = await Service.findOne({ _id: id, vendorId: userId });

    if (!service) {
      return res.status(404).json({ message: 'Service not found or you do not have permission to edit it.' });
    }

    // Process new images if uploaded
    const imageFiles = files as Express.Multer.File[];
    const newImagePaths = imageFiles?.length > 0 
      ? imageFiles.map(file => `/uploads/${file.filename}`)
      : undefined;

    // Prepare update data
    const updateData = {
      name: body.name !== undefined ? body.name : service.name,
      description: body.description !== undefined ? body.description : service.description,
      category: body.category !== undefined ? body.category : service.category,
      address: body.address !== undefined ? body.address : service.address,
      city: body.city !== undefined ? body.city : service.city,
      state: body.state !== undefined ? body.state : service.state,
      pincode: body.pincode !== undefined ? body.pincode : service.pincode,
      serviceArea: body.serviceArea !== undefined ? body.serviceArea : service.serviceArea,
      location: body.location !== undefined ? body.location : service.location,
      price: body.price !== undefined ? Number(body.price) : service.price,
      priceRange: body.priceRange !== undefined ? body.priceRange : service.priceRange,
      priceType: body.priceType !== undefined ? body.priceType : service.priceType,
      minimumOrder: body.minimumOrder !== undefined ? body.minimumOrder : service.minimumOrder,
      deliveryCharges: body.deliveryCharges !== undefined ? body.deliveryCharges : service.deliveryCharges,
      specialties: body.specialties !== undefined ? JSON.parse(body.specialties) : service.specialties,
      timing: body.timing !== undefined ? JSON.parse(body.timing) : service.timing,
      images: newImagePaths ? newImagePaths : service.images,
      contactName: body.contactName !== undefined ? body.contactName : service.contactName,
      contactPhone: body.contactPhone !== undefined ? body.contactPhone : service.contactPhone,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : service.contactEmail,
      whatsapp: body.whatsapp !== undefined ? body.whatsapp : service.whatsapp,
      features: body.features !== undefined ? JSON.parse(body.features) : service.features,
      policies: body.policies !== undefined ? body.policies : service.policies,
      contact: body.contact !== undefined ? body.contact : service.contact,
    };

    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: 'Service updated successfully!', service: updatedService });

  } catch (error) {
    console.error('---!!! UPDATE SERVICE FAILED !!!---', error);
    res.status(500).json({ 
      message: 'Server error while updating service.',
      error: (error as Error).message 
    });
  }
};

export const getMyServices = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const { userId } = req.user;

    // Find all services where the vendorId matches the logged-in user's ID
    const services = await Service.find({ vendorId: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching your services.' });
  }
};