import { Request, Response } from 'express';
import Property from '../models/property.model';

// Helper to safely parse JSON strings from FormData
const safeJsonParse = (str: string, defaultValue: any) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

export const createProperty = async (req: Request, res: Response) => {
  try {
          if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const { body, files } = req;
    
    // Type assertion for files from multer
    const imageFiles = files as Express.Multer.File[];
    const imagePaths = imageFiles.map(file => `/uploads/${file.filename}`);

    const propertyData = {
      ...body,
      ownerId: req.user.userId,
      rent: Number(body.rent),
      deposit: Number(body.deposit),
      maintenance: Number(body.maintenance),
      totalRooms: Number(body.totalRooms),
      availableRooms: Number(body.availableRooms),
      bathrooms: Number(body.bathrooms),
      electricityIncluded: body.electricityIncluded === 'true',
      
      // Parse arrays and objects that were stringified in FormData
      amenities: safeJsonParse(body.amenities, []),
      rules: safeJsonParse(body.rules, []),
      timing: safeJsonParse(body.timing, {}),

      images: imagePaths, // Use the paths of the uploaded files
    };
     console.log('--- DATA BEING SAVED ---', propertyData);  
    const newProperty = new Property(propertyData);
    await newProperty.save();

    res.status(201).json({ message: 'Property created successfully!', property: newProperty });

  } catch (error) {
    console.error('---!!! CREATE PROPERTY FAILED !!!---', error);
    res.status(500).json({ 
      message: 'Server error while creating property.',
      error: (error as Error).message 
    });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({}).sort({ createdAt: -1 });
    // Send back the data in a structured object
    res.status(200).json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error while fetching properties.' });
  }
};

// Move deleteProperty outside of getAllProperties
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { userId } = req.user;

    // Find the property by its ID AND make sure the person deleting it is the owner
    const property = await Property.findOneAndDelete({ _id: id, ownerId: userId });

    if (!property) {
      // If no property is found, it's either the wrong ID or not their property.
      // For security, we just say "Not Found".
      return res.status(404).json({ message: 'Property not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Property deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting property.' });
  }
};
export const updateProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { userId } = req.user;
    const { body, files } = req;

    // Find the property to ensure the user owns it
    const property = await Property.findOne({ _id: id, ownerId: userId });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or you do not have permission to edit it.' });
    }

    // Process new images if uploaded
    const imageFiles = files as Express.Multer.File[];
    const newImagePaths = imageFiles?.length > 0 
      ? imageFiles.map(file => `/uploads/${file.filename}`)
      : undefined;

    // Prepare update data
    const updateData = {
      title: body.title !== undefined ? body.title : property.title,
      description: body.description !== undefined ? body.description : property.description,
      propertyType: body.propertyType !== undefined ? body.propertyType : property.propertyType,
      gender: body.gender !== undefined ? body.gender : property.gender,
      address: body.address !== undefined ? body.address : property.address,
      city: body.city !== undefined ? body.city : property.city,
      state: body.state !== undefined ? body.state : property.state,
      pincode: body.pincode !== undefined ? body.pincode : property.pincode,
      landmark: body.landmark !== undefined ? body.landmark : property.landmark,
      rent: body.rent !== undefined ? Number(body.rent) : property.rent,
      deposit: body.deposit !== undefined ? Number(body.deposit) : property.deposit,
      maintenance: body.maintenance !== undefined ? Number(body.maintenance) : property.maintenance,
      electricityIncluded: body.electricityIncluded !== undefined ? body.electricityIncluded === 'true' : property.electricityIncluded,
      totalRooms: body.totalRooms !== undefined ? Number(body.totalRooms) : property.totalRooms,
      availableRooms: body.availableRooms !== undefined ? Number(body.availableRooms) : property.availableRooms,
      roomType: body.roomType !== undefined ? body.roomType : property.roomType,
      bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : property.bathrooms,
      amenities: body.amenities !== undefined ? safeJsonParse(body.amenities, property.amenities) : property.amenities,
      images: newImagePaths ? newImagePaths : property.images,
      contactName: body.contactName !== undefined ? body.contactName : property.contactName,
      contactPhone: body.contactPhone !== undefined ? body.contactPhone : property.contactPhone,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : property.contactEmail,
      rules: body.rules !== undefined ? safeJsonParse(body.rules, property.rules) : property.rules,
      timing: body.timing !== undefined ? safeJsonParse(body.timing, property.timing) : property.timing,
    };

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: 'Property updated successfully!', property: updatedProperty });

  } catch (error) {
    console.error('---!!! UPDATE PROPERTY FAILED !!!---', error);
    res.status(500).json({ 
      message: 'Server error while updating property.',
      error: (error as Error).message 
    });
  }
};

export const getMyProperties = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const { userId } = req.user;

    console.log("--- SEARCHING FOR LISTINGS OWNED BY ---", userId);

    // Find all properties where the ownerId matches the logged-in user's ID
    const properties = await Property.find({ ownerId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching your properties.' });
  }
};