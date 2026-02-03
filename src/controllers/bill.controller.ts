import { Request, Response } from 'express';
import Bill from '../models/bill.model';

// ✅ Create a new bill
export const createBill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { title, description, amount, category, date, splitType, splitBetween, customSplits } = req.body;

    // Validate required fields
    if (!title || !amount || !category || !splitBetween || splitBetween.length === 0) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const billData = {
      title,
      description,
      amount,
      paidBy: req.user.userId,
      category,
      date: date || new Date(),
      splitType: splitType || 'equal',
      splitBetween,
      customSplits: customSplits || {},
    };

    const newBill = new Bill(billData);
    await newBill.save();

    res.status(201).json({ message: 'Bill created successfully!', bill: newBill });
  } catch (error: any) {
    console.error("CREATE BILL FAILED:", error);
    res.status(500).json({ message: 'Server error while creating bill.', error: error.message });
  }
};

// ✅ Get all bills for the current user (both created and involved in)
export const getMyBills = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userId = req.user.userId;

    // Get bills where user is the payer or involved in the split
    const bills = await Bill.find({
      $or: [
        { paidBy: userId },
        { splitBetween: { $in: [userId] } }
      ]
    }).sort({ date: -1 });

    res.status(200).json({ bills, total: bills.length });
  } catch (error: any) {
    console.error("GET BILLS FAILED:", error);
    res.status(500).json({ message: 'Server error while fetching bills.', error: error.message });
  }
};

// ✅ Get bills created by the current user
export const getBillsCreatedByMe = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const bills = await Bill.find({ paidBy: req.user.userId }).sort({ date: -1 });
    res.status(200).json({ bills, total: bills.length });
  } catch (error: any) {
    console.error("GET CREATED BILLS FAILED:", error);
    res.status(500).json({ message: 'Server error while fetching created bills.', error: error.message });
  }
};

// ✅ Get a single bill by ID
export const getBillById = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    res.status(200).json({ bill });
  } catch (error: any) {
    console.error("GET BILL FAILED:", error);
    res.status(500).json({ message: 'Server error while fetching bill.', error: error.message });
  }
};

// ✅ Update a bill
export const updateBill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    // Check if user is the creator
    if (bill.paidBy !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit bills you created.' });
    }

    // Update fields
    const { title, description, amount, category, status, splitType, splitBetween, customSplits } = req.body;
    
    if (title) bill.title = title;
    if (description) bill.description = description;
    if (amount) bill.amount = amount;
    if (category) bill.category = category;
    if (status) bill.status = status;
    if (splitType) bill.splitType = splitType;
    if (splitBetween) bill.splitBetween = splitBetween;
    if (customSplits) bill.customSplits = customSplits;

    await bill.save();
    res.status(200).json({ message: 'Bill updated successfully!', bill });
  } catch (error: any) {
    console.error("UPDATE BILL FAILED:", error);
    res.status(500).json({ message: 'Server error while updating bill.', error: error.message });
  }
};

// ✅ Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    // Check if user is the creator
    if (bill.paidBy !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete bills you created.' });
    }

    await Bill.findByIdAndDelete(req.params.billId);
    res.status(200).json({ message: 'Bill deleted successfully.' });
  } catch (error: any) {
    console.error("DELETE BILL FAILED:", error);
    res.status(500).json({ message: 'Server error while deleting bill.', error: error.message });
  }
};

// ✅ Mark bill as settled
export const settleBill = async (req: Request, res: Response) => {
  try {
    if (!req.user || !('userId' in req.user)) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    bill.status = 'settled';
    await bill.save();

    res.status(200).json({ message: 'Bill marked as settled!', bill });
  } catch (error: any) {
    console.error("SETTLE BILL FAILED:", error);
    res.status(500).json({ message: 'Server error while settling bill.', error: error.message });
  }
};