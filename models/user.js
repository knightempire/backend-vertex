const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define the user schema
const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  password:   { type: String, required: true }, 
  email:      { type: String, required: true, unique: true },

  loginHistory: [{ type: Date }], 
  rewardPoints: { type: Number, default: 0 }, 
  lastLoginDate: { type: Date }, 
  consecutiveDays: { type: Number, default: 0 } 
});

userSchema.methods.recordLogin = async function() {
  const today = moment.tz("Asia/Kolkata").toDate();
  const lastLoginDate = this.lastLoginDate ? new Date(this.lastLoginDate) : null;


  this.loginHistory.push(today);
  
  if (lastLoginDate) {
    const diffInTime = today - lastLoginDate;
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    
 
    if (diffInDays === 1) {
      this.consecutiveDays += 1;
    } else if (diffInDays > 1) {
      this.consecutiveDays = 1;
    }
  } else {
    this.consecutiveDays = 1;
  }
  
  const rewardPoints = this.consecutiveDays * this.consecutiveDays; 
  this.rewardPoints += rewardPoints;

  this.lastLoginDate = today;

  await this.save();
};


userSchema.methods.getLoginDates = function() {
  const uniqueDates = new Set(
    this.loginHistory.map(ts => moment(ts).tz("Asia/Kolkata").format('DD-MM-YYYY'))
  );
  return Array.from(uniqueDates);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
