const mongoose = require( 'mongoose' );

/* subdocument */
var attributeSchema = new mongoose.Schema( {
  SubjCode: { type: String, required: true },
  CrseNumb: { type: String, required: true },
  Title: { type: String, required: true },
  CreditHrLow: String,
  CreditHrHigh: String
} );

/* subdocument */
/*
var prereqSchema = new mongoose.Schema( {
  SubjCodePreq: String,
  CrseNumbPreq: String,
  MinGrde: String,
  LevlCode: String
} );
*/

/* subdocument */
var meetingSchema = new mongoose.Schema( {
  BeginTime: String,
  EndTime: String,
  BldgCode: String,
  RoomCode: String,
  StartDate: String,
  EndDate: String,
  SunDay: String,
  MonDay: String,
  TueDay: String,
  WedDay: String,
  ThuDay: String,
  FriDay: String,
  SatDay: String
} );

/* subdocument */
var sectionSchema = new mongoose.Schema( {
  TermCode: String,
  TermLit: String,
  Crn: String,
  SeqNumb: String,
  CampCode: String,
  CreditHrs: String,
  MaxEnrl: String,
  Enrl: String,
  SeatsAvail: String,
  WaitCapacity: String,
  WaitCount: String,
  WaitAvail: String,
  Meetings: [meetingSchema]
} );

var classSchema = new mongoose.Schema( {
  Attributes: attributeSchema,
  Prereqs: String,
  Sections: [sectionSchema]
} );

mongoose.model( 'Class', classSchema, 'classes' );
/*
mongoose.model( 'Prereq', prereqSchema );
mongoose.model( 'Meeting', meetingSchema );
mongoose.model( 'Section', sectionSchema );
*/
