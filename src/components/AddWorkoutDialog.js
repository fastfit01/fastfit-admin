// // // // import React, { useState } from 'react';
// // // // import {
// // // //   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
// // // //   InputLabel, Select, MenuItem, Box, Chip, Typography, Checkbox, FormControlLabel
// // // // } from '@mui/material';
// // // // import { addWorkout } from '../firebase/workoutsService';

// // // // const AddWorkoutDialog = ({ open, onClose }) => {
// // // //   const [workout, setWorkout] = useState({
// // // //     gymWorkout: {
// // // //       beginner: {
// // // //         days: []
// // // //       },
// // // //       intermediate: {
// // // //         days: []
// // // //       },
// // // //       advanced: {
// // // //         days: []
// // // //       }
// // // //     },
// // // //     homeWorkout: ""
// // // //   });

// // // //   const [currentLevel, setCurrentLevel] = useState('beginner');
// // // //   const [currentEquipment, setCurrentEquipment] = useState('');
// // // //   const [currentTargetArea, setCurrentTargetArea] = useState('');

// // // //   const handleChange = (event) => {
// // // //     const { name, value } = event.target;
// // // //     setWorkout(prevWorkout => ({
// // // //       ...prevWorkout,
// // // //       gymWorkout: {
// // // //         ...prevWorkout.gymWorkout,
// // // //         [currentLevel]: {
// // // //           ...prevWorkout.gymWorkout[currentLevel],
// // // //           [name]: value
// // // //         }
// // // //       }
// // // //     }));
// // // //   };

// // // //   const handleAddDay = () => {
// // // //     setWorkout(prevWorkout => ({
// // // //       ...prevWorkout,
// // // //       gymWorkout: {
// // // //         ...prevWorkout.gymWorkout,
// // // //         [currentLevel]: {
// // // //           ...prevWorkout.gymWorkout[currentLevel],
// // // //           days: [
// // // //             ...prevWorkout.gymWorkout[currentLevel].days,
// // // //             {
// // // //               day: prevWorkout.gymWorkout[currentLevel].days.length + 1,
// // // //               EquipmentNeeded: [],
// // // //               EstimatedTime: "",
// // // //               Focus: "",
// // // //               Mindfulness: [],
// // // //               Stretch: [],
// // // //               TargetAreas: [],
// // // //               WarmUp: [],
// // // //               Workout: []
// // // //             }
// // // //           ]
// // // //         }
// // // //       }
// // // //     }));
// // // //   };

// // // //   const handleAddEquipment = () => {
// // // //     if (currentEquipment) {
// // // //       setWorkout(prevWorkout => ({
// // // //         ...prevWorkout,
// // // //         gymWorkout: {
// // // //           ...prevWorkout.gymWorkout,
// // // //           [currentLevel]: {
// // // //             ...prevWorkout.gymWorkout[currentLevel],
// // // //             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
// // // //               index === prevWorkout.gymWorkout[currentLevel].days.length - 1
// // // //                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
// // // //                 : day
// // // //             )
// // // //           }
// // // //         }
// // // //       }));
// // // //       setCurrentEquipment('');
// // // //     }
// // // //   };

// // // //   const handleAddTargetArea = () => {
// // // //     if (currentTargetArea) {
// // // //       setWorkout(prevWorkout => ({
// // // //         ...prevWorkout,
// // // //         gymWorkout: {
// // // //           ...prevWorkout.gymWorkout,
// // // //           [currentLevel]: {
// // // //             ...prevWorkout.gymWorkout[currentLevel],
// // // //             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
// // // //               index === prevWorkout.gymWorkout[currentLevel].days.length - 1
// // // //                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
// // // //                 : day
// // // //             )
// // // //           }
// // // //         }
// // // //       }));
// // // //       setCurrentTargetArea('');
// // // //     }
// // // //   };

// // // //   const handleSubmit = async () => {
// // // //     try {
// // // //       await addWorkout(workout);
// // // //       onClose();
// // // //     } catch (error) {
// // // //       console.error("Error adding workout:", error);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
// // // //       <DialogTitle>Add New Workout</DialogTitle>
// // // //       <DialogContent>
// // // //         <Grid container spacing={2}>
// // // //           <Grid item xs={12}>
// // // //             <FormControl fullWidth>
// // // //               <InputLabel>Level</InputLabel>
// // // //               <Select
// // // //                 value={currentLevel}
// // // //                 onChange={(e) => setCurrentLevel(e.target.value)}
// // // //               >
// // // //                 <MenuItem value="beginner">Beginner</MenuItem>
// // // //                 <MenuItem value="intermediate">Intermediate</MenuItem>
// // // //                 <MenuItem value="advanced">Advanced</MenuItem>
// // // //               </Select>
// // // //             </FormControl>
// // // //           </Grid>
// // // //           <Grid item xs={12}>
// // // //             <Button onClick={handleAddDay}>Add Day</Button>
// // // //           </Grid>
// // // //           {workout.gymWorkout[currentLevel].days.map((day, dayIndex) => (
// // // //             <Grid item xs={12} key={dayIndex}>
// // // //               <Typography variant="h6">Day {day.day}</Typography>
// // // //               <TextField
// // // //                 fullWidth
// // // //                 label="Estimated Time"
// // // //                 value={day.EstimatedTime}
// // // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].EstimatedTime`, value: e.target.value } })}
// // // //               />
// // // //               <TextField
// // // //                 fullWidth
// // // //                 label="Focus"
// // // //                 value={day.Focus}
// // // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Focus`, value: e.target.value } })}
// // // //               />
// // // //               <Box display="flex" alignItems="center">
// // // //                 <TextField
// // // //                   fullWidth
// // // //                   label="Equipment Needed"
// // // //                   value={currentEquipment}
// // // //                   onChange={(e) => setCurrentEquipment(e.target.value)}
// // // //                 />
// // // //                 <Button onClick={handleAddEquipment}>Add</Button>
// // // //               </Box>
// // // //               <Box mt={1}>
// // // //                 {day.EquipmentNeeded.map((equipment, index) => (
// // // //                   <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // // //                 ))}
// // // //               </Box>
// // // //               <Box display="flex" alignItems="center">
// // // //                 <TextField
// // // //                   fullWidth
// // // //                   label="Target Areas"
// // // //                   value={currentTargetArea}
// // // //                   onChange={(e) => setCurrentTargetArea(e.target.value)}
// // // //                 />
// // // //                 <Button onClick={handleAddTargetArea}>Add</Button>
// // // //               </Box>
// // // //               <Box mt={1}>
// // // //                 {day.TargetAreas.map((area, index) => (
// // // //                   <Chip key={index} label={area} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // // //                 ))}
// // // //               </Box>
// // // //               {/* Add similar sections for Mindfulness, Stretch, WarmUp, and Workout */}
// // // //             </Grid>
// // // //           ))}
// // // //         </Grid>
// // // //       </DialogContent>
// // // //       <DialogActions>
// // // //         <Button onClick={onClose}>Cancel</Button>
// // // //         <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
// // // //       </DialogActions>
// // // //     </Dialog>
// // // //   );
// // // // };

// // // // export default AddWorkoutDialog;











// // // import React, { useState } from 'react';
// // // import {
// // //   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
// // //   InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
// // // } from '@mui/material';
// // // import { addWorkout, uploadImage } from '../firebase/workoutsService';

// // // const AddWorkoutDialog = ({ open, onClose }) => {
// // //   const [workout, setWorkout] = useState({
// // //     gymWorkout: {
// // //       beginner: {
// // //         days: []
// // //       },
// // //       intermediate: {
// // //         days: []
// // //       },
// // //       advanced: {
// // //         days: []
// // //       }
// // //     },
// // //     homeWorkout: ""
// // //   });

// // //   const [currentLevel, setCurrentLevel] = useState('beginner');
// // //   const [currentEquipment, setCurrentEquipment] = useState('');
// // //   const [currentTargetArea, setCurrentTargetArea] = useState('');
// // //   const [isExercise, setIsExercise] = useState(true);

// // //   const handleChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       gymWorkout: {
// // //         ...prevWorkout.gymWorkout,
// // //         [currentLevel]: {
// // //           ...prevWorkout.gymWorkout[currentLevel],
// // //           [name]: value
// // //         }
// // //       }
// // //     }));
// // //   };

// // //   const handleAddDay = () => {
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       gymWorkout: {
// // //         ...prevWorkout.gymWorkout,
// // //         [currentLevel]: {
// // //           ...prevWorkout.gymWorkout[currentLevel],
// // //           days: [
// // //             ...prevWorkout.gymWorkout[currentLevel].days,
// // //             {
// // //               day: prevWorkout.gymWorkout[currentLevel].days.length + 1,
// // //               EquipmentNeeded: [],
// // //               EstimatedTime: "",
// // //               Focus: "",
// // //               Mindfulness: [],
// // //               Stretch: [],
// // //               TargetAreas: [],
// // //               WarmUp: [],
// // //               Workout: [],
// // //               isExercise: true,
// // //               imageUrl: ""
// // //             }
// // //           ]
// // //         }
// // //       }
// // //     }));
// // //   };

// // //   const handleAddEquipment = () => {
// // //     if (currentEquipment) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         gymWorkout: {
// // //           ...prevWorkout.gymWorkout,
// // //           [currentLevel]: {
// // //             ...prevWorkout.gymWorkout[currentLevel],
// // //             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
// // //               index === prevWorkout.gymWorkout[currentLevel].days.length - 1
// // //                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentEquipment('');
// // //     }
// // //   };

// // //   const handleAddTargetArea = () => {
// // //     if (currentTargetArea) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         gymWorkout: {
// // //           ...prevWorkout.gymWorkout,
// // //           [currentLevel]: {
// // //             ...prevWorkout.gymWorkout[currentLevel],
// // //             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
// // //               index === prevWorkout.gymWorkout[currentLevel].days.length - 1
// // //                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentTargetArea('');
// // //     }
// // //   };

// // //   const handleImageUpload = async (event, dayIndex) => {
// // //     const file = event.target.files[0];
// // //     if (file) {
// // //       try {
// // //         const imageUrl = await uploadImage(file);
// // //         setWorkout(prevWorkout => ({
// // //           ...prevWorkout,
// // //           gymWorkout: {
// // //             ...prevWorkout.gymWorkout,
// // //             [currentLevel]: {
// // //               ...prevWorkout.gymWorkout[currentLevel],
// // //               days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
// // //                 index === dayIndex
// // //                   ? { ...day, imageUrl: imageUrl }
// // //                   : day
// // //               )
// // //             }
// // //           }
// // //         }));
// // //       } catch (error) {
// // //         console.error("Error uploading image:", error);
// // //       }
// // //     }
// // //   };

// // //   const handleSubmit = async () => {
// // //     try {
// // //       await addWorkout(workout);
// // //       onClose();
// // //     } catch (error) {
// // //       console.error("Error adding workout:", error);
// // //     }
// // //   };

// // //   return (
// // //     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
// // //       <DialogTitle>Add New Workout</DialogTitle>
// // //       <DialogContent>
// // //         <Grid container spacing={2}>
// // //           <Grid item xs={12}>
// // //             <FormControl fullWidth>
// // //               <InputLabel>Level</InputLabel>
// // //               <Select
// // //                 value={currentLevel}
// // //                 onChange={(e) => setCurrentLevel(e.target.value)}
// // //               >
// // //                 <MenuItem value="beginner">Beginner</MenuItem>
// // //                 <MenuItem value="intermediate">Intermediate</MenuItem>
// // //                 <MenuItem value="advanced">Advanced</MenuItem>
// // //               </Select>
// // //             </FormControl>
// // //           </Grid>
// // //           <Grid item xs={12}>
// // //             <Button onClick={handleAddDay}>Add Day</Button>
// // //           </Grid>
// // //           {workout.gymWorkout[currentLevel].days.map((day, dayIndex) => (
// // //             <Grid item xs={12} key={dayIndex}>
// // //               <Typography variant="h6">Day {day.day}</Typography>
// // //               <FormControlLabel
// // //                 control={
// // //                   <Switch
// // //                     checked={day.isExercise}
// // //                     onChange={(e) => {
// // //                       setWorkout(prevWorkout => ({
// // //                         ...prevWorkout,
// // //                         gymWorkout: {
// // //                           ...prevWorkout.gymWorkout,
// // //                           [currentLevel]: {
// // //                             ...prevWorkout.gymWorkout[currentLevel],
// // //                             days: prevWorkout.gymWorkout[currentLevel].days.map((d, i) => 
// // //                               i === dayIndex ? { ...d, isExercise: e.target.checked } : d
// // //                             )
// // //                           }
// // //                         }
// // //                       }));
// // //                     }}
// // //                   />
// // //                 }
// // //                 label={day.isExercise ? "Exercise" : "Rest"}
// // //               />
// // //               <TextField
// // //                 fullWidth
// // //                 label="Estimated Time"
// // //                 value={day.EstimatedTime}
// // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].EstimatedTime`, value: e.target.value } })}
// // //               />
// // //               <TextField
// // //                 fullWidth
// // //                 label="Focus"
// // //                 value={day.Focus}
// // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Focus`, value: e.target.value } })}
// // //               />
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Equipment Needed"
// // //                   value={currentEquipment}
// // //                   onChange={(e) => setCurrentEquipment(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddEquipment}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.EquipmentNeeded.map((equipment, index) => (
// // //                   <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Target Areas"
// // //                   value={currentTargetArea}
// // //                   onChange={(e) => setCurrentTargetArea(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddTargetArea}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.TargetAreas.map((area, index) => (
// // //                   <Chip key={index} label={area} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <input
// // //                 accept="image/*"
// // //                 style={{ display: 'none' }}
// // //                 id={`image-upload-${dayIndex}`}
// // //                 type="file"
// // //                 onChange={(e) => handleImageUpload(e, dayIndex)}
// // //               />
// // //               <label htmlFor={`image-upload-${dayIndex}`}>
// // //                 <Button variant="contained" component="span">
// // //                   Upload Image/GIF
// // //                 </Button>
// // //               </label>
// // //               {day.imageUrl && (
// // //                 <img src={day.imageUrl} alt="Uploaded" style={{ width: 100, height: 100, objectFit: 'cover' }} />
// // //               )}
// // //               {/* Add similar sections for Mindfulness, Stretch, WarmUp, and Workout */}
// // //             </Grid>
// // //           ))}
// // //         </Grid>
// // //       </DialogContent>
// // //       <DialogActions>
// // //         <Button onClick={onClose}>Cancel</Button>
// // //         <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
// // //       </DialogActions>
// // //     </Dialog>
// // //   );
// // // };

// // // export default AddWorkoutDialog;

























// // // import React, { useState } from 'react';
// // // import {
// // //   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
// // //   InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
// // // } from '@mui/material';
// // // import { addWorkout, uploadImage } from '../firebase/workoutsService';

// // // const AddWorkoutDialog = ({ open, onClose }) => {
// // //   const [workout, setWorkout] = useState({
// // //     gymWorkout: {
// // //       beginner: { days: [] },
// // //       intermediate: { days: [] },
// // //       advanced: { days: [] }
// // //     },
// // //     homeWorkout: { days: [] }
// // //   });

// // //   const [workoutType, setWorkoutType] = useState('gymWorkout');
// // //   const [currentLevel, setCurrentLevel] = useState('beginner');
// // //   const [currentEquipment, setCurrentEquipment] = useState('');
// // //   const [currentTargetArea, setCurrentTargetArea] = useState('');
// // //   const [isExercise, setIsExercise] = useState(true);

// // //   const handleChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       [workoutType]: {
// // //         ...prevWorkout[workoutType],
// // //         [currentLevel]: {
// // //           ...prevWorkout[workoutType][currentLevel],
// // //           [name]: value
// // //         }
// // //       }
// // //     }));
// // //   };

// // //   const handleAddDay = () => {
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       [workoutType]: {
// // //         ...prevWorkout[workoutType],
// // //         [currentLevel]: {
// // //           ...prevWorkout[workoutType][currentLevel],
// // //           days: [
// // //             ...prevWorkout[workoutType][currentLevel].days,
// // //             {
// // //               day: prevWorkout[workoutType][currentLevel].days.length + 1,
// // //               EquipmentNeeded: [],
// // //               EstimatedTime: "",
// // //               Focus: "",
// // //               Mindfulness: [],
// // //               Stretch: [],
// // //               TargetAreas: [],
// // //               WarmUp: [],
// // //               Workout: [],
// // //               isExercise: true,
// // //               imageUrl: ""
// // //             }
// // //           ]
// // //         }
// // //       }
// // //     }));

// // //     console.log("workout=>", workout);

// // //   };

// // //   const handleAddEquipment = () => {
// // //     if (currentEquipment) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         [workoutType]: {
// // //           ...prevWorkout[workoutType],
// // //           [currentLevel]: {
// // //             ...prevWorkout[workoutType][currentLevel],
// // //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// // //                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentEquipment('');
// // //     }
// // //   };

// // //   const handleAddTargetArea = () => {
// // //     if (currentTargetArea) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         [workoutType]: {
// // //           ...prevWorkout[workoutType],
// // //           [currentLevel]: {
// // //             ...prevWorkout[workoutType][currentLevel],
// // //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// // //                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentTargetArea('');
// // //     }
// // //   };

// // //   const handleImageUpload = async (event, dayIndex) => {
// // //     const file = event.target.files[0];
// // //     if (file) {
// // //       try {
// // //         const imageUrl = await uploadImage(file);
// // //         setWorkout(prevWorkout => ({
// // //           ...prevWorkout,
// // //           [workoutType]: {
// // //             ...prevWorkout[workoutType],
// // //             [currentLevel]: {
// // //               ...prevWorkout[workoutType][currentLevel],
// // //               days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //                 index === dayIndex
// // //                   ? { ...day, imageUrl: imageUrl }
// // //                   : day
// // //               )
// // //             }
// // //           }
// // //         }));
// // //       } catch (error) {
// // //         console.error("Error uploading image:", error);
// // //       }
// // //     }
// // //   };

// // //   const handleSubmit = async () => {
// // //     try {
// // //       await addWorkout(workout);
// // //       onClose();
// // //     } catch (error) {
// // //       console.error("Error adding workout:", error);
// // //     }
// // //   };

// // //   return (
// // //     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
// // //       <DialogTitle>Add New Workout</DialogTitle>
// // //       <DialogContent>
// // //         <Grid container spacing={2}>
// // //           <Grid item xs={12}>
// // //             <FormControl fullWidth>
// // //               <InputLabel>Workout Type</InputLabel>
// // //               <Select
// // //                 value={workoutType}
// // //                 onChange={(e) => setWorkoutType(e.target.value)}
// // //               >
// // //                 <MenuItem value="gymWorkout">Gym Workout</MenuItem>
// // //                 <MenuItem value="homeWorkout">Home Workout</MenuItem>
// // //               </Select>
// // //             </FormControl>
// // //           </Grid>
// // //           {workoutType === 'gymWorkout' && (
// // //             <Grid item xs={12}>
// // //               <FormControl fullWidth>
// // //                 <InputLabel>Level</InputLabel>
// // //                 <Select
// // //                   value={currentLevel}
// // //                   onChange={(e) => setCurrentLevel(e.target.value)}
// // //                 >
// // //                   <MenuItem value="beginner">Beginner</MenuItem>
// // //                   <MenuItem value="intermediate">Intermediate</MenuItem>
// // //                   <MenuItem value="advanced">Advanced</MenuItem>
// // //                 </Select>
// // //               </FormControl>
// // //             </Grid>
// // //           )}
// // //           <Grid item xs={12}>
// // //             <Button onClick={handleAddDay}>Add Day</Button>
// // //           </Grid>
// // //           {workout[workoutType][currentLevel].days.map((day, dayIndex) => (
// // //             <Grid item xs={12} key={dayIndex}>
// // //               <Typography variant="h6">Day {day.day}</Typography>
// // //               <FormControlLabel
// // //                 control={
// // //                   <Switch
// // //                     checked={day.isExercise}
// // //                     onChange={(e) => {
// // //                       setWorkout(prevWorkout => ({
// // //                         ...prevWorkout,
// // //                         [workoutType]: {
// // //                           ...prevWorkout[workoutType],
// // //                           [currentLevel]: {
// // //                             ...prevWorkout[workoutType][currentLevel],
// // //                             days: prevWorkout[workoutType][currentLevel].days.map((d, i) => 
// // //                               i === dayIndex ? { ...d, isExercise: e.target.checked } : d
// // //                             )
// // //                           }
// // //                         }
// // //                       }));
// // //                     }}
// // //                   />
// // //                 }
// // //                 label={day.isExercise ? "Exercise" : "Rest"}
// // //               />
// // //               {/* Day details form */}
// // //               <TextField
// // //                 fullWidth
// // //                 label="Estimated Time"
// // //                 value={day.EstimatedTime}
// // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].EstimatedTime`, value: e.target.value } })}
// // //               />
// // //               <TextField
// // //                 fullWidth
// // //                 label="Focus"
// // //                 value={day.Focus}
// // //                 onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Focus`, value: e.target.value } })}
// // //               />
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Equipment Needed"
// // //                   value={currentEquipment}
// // //                   onChange={(e) => setCurrentEquipment(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddEquipment}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.EquipmentNeeded.map((equipment, index) => (
// // //                   <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Target Areas"
// // //                   value={currentTargetArea}
// // //                   onChange={(e) => setCurrentTargetArea(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddTargetArea}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.TargetAreas.map((area, index) => (
// // //                   <Chip key={index} label={area} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <input
// // //                 accept="image/*"
// // //                 style={{ display: 'none' }}
// // //                 id={`image-upload-${dayIndex}`}
// // //                 type="file"
// // //                 onChange={(e) => handleImageUpload(e, dayIndex)}
// // //               />
// // //               <label htmlFor={`image-upload-${dayIndex}`}>
// // //                 <Button variant="contained" component="span">
// // //                   Upload Image/GIF
// // //                 </Button>
// // //               </label>
// // //               {day.imageUrl && (
// // //                 <img src={day.imageUrl} alt="Uploaded" style={{ width: 100, height: 100, objectFit: 'cover' }} />
// // //               )}
// // //               {/* Add similar sections for Mindfulness, Stretch, WarmUp, and Workout */}
// // //             </Grid>
// // //           ))}
// // //         </Grid>
// // //       </DialogContent>
// // //       <DialogActions>
// // //         <Button onClick={onClose}>Cancel</Button>
// // //         <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
// // //       </DialogActions>
// // //     </Dialog>
// // //   );
// // // };

// // // export default AddWorkoutDialog




// // // import React, { useState } from 'react';
// // // import {
// // //   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
// // //   InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
// // // } from '@mui/material';
// // // import { addWorkout, uploadImage } from '../firebase/workoutsService';

// // // const AddWorkoutDialog = ({ open, onClose }) => {
// // //   const [workout, setWorkout] = useState({
// // //     gymWorkout: {
// // //       beginner: { days: [] },
// // //       intermediate: { days: [] },
// // //       advanced: { days: [] }
// // //     },
// // //     homeWorkout: { beginner: { days: [] }, intermediate: { days: [] }, advanced: { days: [] } }
// // //   });

// // //   const [workoutType, setWorkoutType] = useState('gymWorkout');
// // //   const [currentLevel, setCurrentLevel] = useState('beginner');
// // //   const [currentEquipment, setCurrentEquipment] = useState('');
// // //   const [currentTargetArea, setCurrentTargetArea] = useState('');
// // //   const [isExercise, setIsExercise] = useState(true);

// // //   const handleChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       [workoutType]: {
// // //         ...prevWorkout[workoutType],
// // //         [currentLevel]: {
// // //           ...prevWorkout[workoutType][currentLevel],
// // //           [name]: value
// // //         }
// // //       }
// // //     }));
// // //   };

// // //   const handleAddDay = () => {
// // //     setWorkout(prevWorkout => ({
// // //       ...prevWorkout,
// // //       [workoutType]: {
// // //         ...prevWorkout[workoutType],
// // //         [currentLevel]: {
// // //           ...prevWorkout[workoutType][currentLevel],
// // //           days: [
// // //             ...prevWorkout[workoutType][currentLevel].days,
// // //             {
// // //               day: prevWorkout[workoutType][currentLevel].days.length + 1,
// // //               EquipmentNeeded: [],
// // //               EstimatedTime: "",
// // //               Focus: "",
// // //               Mindfulness: [],
// // //               Stretch: [],
// // //               TargetAreas: [],
// // //               WarmUp: [],
// // //               Workout: [],
// // //               isExercise: true,
// // //               imageUrl: ""
// // //             }
// // //           ]
// // //         }
// // //       }
// // //     }));
// // //   };

// // //   const handleAddEquipment = () => {
// // //     if (currentEquipment) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         [workoutType]: {
// // //           ...prevWorkout[workoutType],
// // //           [currentLevel]: {
// // //             ...prevWorkout[workoutType][currentLevel],
// // //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// // //                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentEquipment('');
// // //     }
// // //   };

// // //   const handleAddTargetArea = () => {
// // //     if (currentTargetArea) {
// // //       setWorkout(prevWorkout => ({
// // //         ...prevWorkout,
// // //         [workoutType]: {
// // //           ...prevWorkout[workoutType],
// // //           [currentLevel]: {
// // //             ...prevWorkout[workoutType][currentLevel],
// // //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// // //                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
// // //                 : day
// // //             )
// // //           }
// // //         }
// // //       }));
// // //       setCurrentTargetArea('');
// // //     }
// // //   };

// // //   const handleImageUpload = async (event, dayIndex) => {
// // //     const file = event.target.files[0];
// // //     if (file) {
// // //       try {
// // //         const imageUrl = await uploadImage(file);
// // //         setWorkout(prevWorkout => ({
// // //           ...prevWorkout,
// // //           [workoutType]: {
// // //             ...prevWorkout[workoutType],
// // //             [currentLevel]: {
// // //               ...prevWorkout[workoutType][currentLevel],
// // //               days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// // //                 index === dayIndex
// // //                   ? { ...day, imageUrl: imageUrl }
// // //                   : day
// // //               )
// // //             }
// // //           }
// // //         }));
// // //       } catch (error) {
// // //         console.error("Error uploading image:", error);
// // //       }
// // //     }
// // //   };

// // //   const handleSubmit = async () => {
// // //     try {
// // //       await addWorkout(workout);
// // //       onClose();
// // //     } catch (error) {
// // //       console.error("Error adding workout:", error);
// // //     }
// // //   };

// // //   return (
// // //     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
// // //       <DialogTitle>Add New Workout</DialogTitle>
// // //       <DialogContent>
// // //         <Grid container spacing={2}>
// // //           <Grid item xs={12}>
// // //             <FormControl fullWidth>
// // //               <InputLabel>Workout Type</InputLabel>
// // //               <Select
// // //                 value={workoutType}
// // //                 onChange={(e) => setWorkoutType(e.target.value)}
// // //               >
// // //                 <MenuItem value="gymWorkout">Gym Workout</MenuItem>
// // //                 <MenuItem value="homeWorkout">Home Workout</MenuItem>
// // //               </Select>
// // //             </FormControl>
// // //           </Grid>
// // //           {workoutType === 'gymWorkout' && (
// // //             <Grid item xs={12}>
// // //               <FormControl fullWidth>
// // //                 <InputLabel>Level</InputLabel>
// // //                 <Select
// // //                   value={currentLevel}
// // //                   onChange={(e) => setCurrentLevel(e.target.value)}
// // //                 >
// // //                   <MenuItem value="beginner">Beginner</MenuItem>
// // //                   <MenuItem value="intermediate">Intermediate</MenuItem>
// // //                   <MenuItem value="advanced">Advanced</MenuItem>
// // //                 </Select>
// // //               </FormControl>
// // //             </Grid>
// // //           )}
// // //           <Grid item xs={12}>
// // //             <Button onClick={handleAddDay}>Add Day</Button>
// // //           </Grid>
// // //           {workout[workoutType][currentLevel].days.map((day, dayIndex) => (
// // //             <Grid item xs={12} key={dayIndex}>
// // //               <Typography variant="h6">Day {day.day}</Typography>
// // //               <FormControlLabel
// // //                 control={
// // //                   <Switch
// // //                     checked={day.isExercise}
// // //                     onChange={(e) => {
// // //                       setWorkout(prevWorkout => ({
// // //                         ...prevWorkout,
// // //                         [workoutType]: {
// // //                           ...prevWorkout[workoutType],
// // //                           [currentLevel]: {
// // //                             ...prevWorkout[workoutType][currentLevel],
// // //                             days: prevWorkout[workoutType][currentLevel].days.map((d, i) => 
// // //                               i === dayIndex ? { ...d, isExercise: e.target.checked } : d
// // //                             )
// // //                           }
// // //                         }
// // //                       }));
// // //                     }}
// // //                   />
// // //                 }
// // //                 label={day.isExercise ? "Exercise" : "Rest"}
// // //               />
// // //               {/* Conditionally Render Inputs */}
// // //               {day.isExercise ? (
// // //                 <>
// // //                   <TextField
// // //                     fullWidth
// // //                     label="Estimated Time"
// // //                     value={day.EstimatedTime}
// // //                     onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].EstimatedTime`, value: e.target.value } })}
// // //                   />
// // //                   <TextField
// // //                     fullWidth
// // //                     label="Focus"
// // //                     value={day.Focus}
// // //                     onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Focus`, value: e.target.value } })}
// // //                   />
// // //                   {/* Add more inputs as needed for exercise */}
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   {/* Inputs specific to rest periods */}
// // //                   <Typography variant="body2">Rest Day Configuration</Typography>
// // //                   {/* Add more inputs for rest configuration */}
// // //                 </>
// // //               )}
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Equipment Needed"
// // //                   value={currentEquipment}
// // //                   onChange={(e) => setCurrentEquipment(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddEquipment}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.EquipmentNeeded.map((equipment, index) => (
// // //                   <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <Box display="flex" alignItems="center">
// // //                 <TextField
// // //                   fullWidth
// // //                   label="Target Areas"
// // //                   value={currentTargetArea}
// // //                   onChange={(e) => setCurrentTargetArea(e.target.value)}
// // //                 />
// // //                 <Button onClick={handleAddTargetArea}>Add</Button>
// // //               </Box>
// // //               <Box mt={1}>
// // //                 {day.TargetAreas.map((area, index) => (
// // //                   <Chip key={index} label={area} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
// // //                 ))}
// // //               </Box>
// // //               <Box mt={2}>
// // //                 <input
// // //                   accept="image/*"
// // //                   type="file"
// // //                   onChange={(e) => handleImageUpload(e, dayIndex)}
// // //                 />
// // //                 {day.imageUrl && <img src={day.imageUrl} alt="Preview" style={{ width: 100, height: 100, borderRadius: '10%' }} />}
// // //                   {/* Add similar sections for Mindfulness, Stretch, WarmUp, and Workout */}
// // //               </Box>
// // //             </Grid>
// // //           ))}
// // //         </Grid>
// // //       </DialogContent>
// // //       <DialogActions>
// // //         <Button onClick={onClose}>Cancel</Button>
// // //         <Button onClick={handleSubmit}>Save</Button>
// // //       </DialogActions>
// // //     </Dialog>
// // //   );
// // // };

// // // export default AddWorkoutDialog;



// // import React, { useState } from 'react';
// // import {
// //   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
// //   InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
// // } from '@mui/material';
// // import { addWorkout, uploadImage } from '../firebase/workoutsService';

// // const AddWorkoutDialog = ({ open, onClose }) => {
// //   const [workout, setWorkout] = useState({
// //     gymWorkout: {
// //       beginner: { days: [] },
// //       intermediate: { days: [] },
// //       advanced: { days: [] }
// //     },
// //     homeWorkout: {
// //       beginner: { days: [] },
// //       intermediate: { days: [] },
// //       advanced: { days: [] }
// //     }
// //   });

// //   const [workoutType, setWorkoutType] = useState('gymWorkout');
// //   const [currentLevel, setCurrentLevel] = useState('beginner');
// //   const [currentEquipment, setCurrentEquipment] = useState('');
// //   const [currentTargetArea, setCurrentTargetArea] = useState('');
// //   const [isExercise, setIsExercise] = useState(true);

// //   const handleChange = (event) => {
// //     const { name, value } = event.target;
// //     setWorkout(prevWorkout => ({
// //       ...prevWorkout,
// //       [workoutType]: {
// //         ...prevWorkout[workoutType],
// //         [currentLevel]: {
// //           ...prevWorkout[workoutType][currentLevel],
// //           [name]: value
// //         }
// //       }
// //     }));
// //   };

// //   const handleAddDay = () => {
// //     setWorkout(prevWorkout => ({
// //       ...prevWorkout,
// //       [workoutType]: {
// //         ...prevWorkout[workoutType],
// //         [currentLevel]: {
// //           ...prevWorkout[workoutType][currentLevel],
// //           days: [
// //             ...prevWorkout[workoutType][currentLevel].days,
// //             {
// //               day: prevWorkout[workoutType][currentLevel].days.length + 1,
// //               EquipmentNeeded: [],
// //               EstimatedTime: "",
// //               Focus: "",
// //               Mindfulness: [],
// //               Stretch: [],
// //               TargetAreas: [],
// //               WarmUp: [],
// //               Workout: [],
// //               isExercise: true,
// //               imageUrl: ""
// //             }
// //           ]
// //         }
// //       }
// //     }));
// //   };

// //   const handleAddEquipment = () => {
// //     if (currentEquipment) {
// //       setWorkout(prevWorkout => ({
// //         ...prevWorkout,
// //         [workoutType]: {
// //           ...prevWorkout[workoutType],
// //           [currentLevel]: {
// //             ...prevWorkout[workoutType][currentLevel],
// //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// //                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
// //                 : day
// //             )
// //           }
// //         }
// //       }));
// //       setCurrentEquipment('');
// //     }
// //   };

// //   const handleAddTargetArea = () => {
// //     if (currentTargetArea) {
// //       setWorkout(prevWorkout => ({
// //         ...prevWorkout,
// //         [workoutType]: {
// //           ...prevWorkout[workoutType],
// //           [currentLevel]: {
// //             ...prevWorkout[workoutType][currentLevel],
// //             days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// //               index === prevWorkout[workoutType][currentLevel].days.length - 1
// //                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
// //                 : day
// //             )
// //           }
// //         }
// //       }));
// //       setCurrentTargetArea('');
// //     }
// //   };

// //   const handleImageUpload = async (event, dayIndex) => {
// //     const file = event.target.files[0];
// //     if (file) {
// //       try {
// //         const imageUrl = await uploadImage(file);
// //         setWorkout(prevWorkout => ({
// //           ...prevWorkout,
// //           [workoutType]: {
// //             ...prevWorkout[workoutType],
// //             [currentLevel]: {
// //               ...prevWorkout[workoutType][currentLevel],
// //               days: prevWorkout[workoutType][currentLevel].days.map((day, index) => 
// //                 index === dayIndex
// //                   ? { ...day, imageUrl: imageUrl }
// //                   : day
// //               )
// //             }
// //           }
// //         }));
// //       } catch (error) {
// //         console.error("Error uploading image:", error);
// //       }
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       await addWorkout(workout);
// //       onClose();
// //     } catch (error) {
// //       console.error("Error adding workout:", error);
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
// //       <DialogTitle>Add New Workout</DialogTitle>
// //       <DialogContent>
// //         <Grid container spacing={2}>
// //           <Grid item xs={12}>
// //             <FormControl fullWidth>
// //               <InputLabel>Workout Type</InputLabel>
// //               <Select
// //                 value={workoutType}
// //                 onChange={(e) => setWorkoutType(e.target.value)}
// //               >
// //                 <MenuItem value="gymWorkout">Gym Workout</MenuItem>
// //                 <MenuItem value="homeWorkout">Home Workout</MenuItem>
// //               </Select>
// //             </FormControl>
// //           </Grid>
// //           <Grid item xs={12}>
// //             <FormControl fullWidth>
// //               <InputLabel>Level</InputLabel>
// //               <Select
// //                 value={currentLevel}
// //                 onChange={(e) => setCurrentLevel(e.target.value)}
// //               >
// //                 <MenuItem value="beginner">Beginner</MenuItem>
// //                 <MenuItem value="intermediate">Intermediate</MenuItem>
// //                 <MenuItem value="advanced">Advanced</MenuItem>
// //               </Select>
// //             </FormControl>
// //           </Grid>
// //           <Grid item xs={12}>
// //             <Button onClick={handleAddDay}>Add Day</Button>
// //           </Grid>
// //           {workout[workoutType][currentLevel].days.map((day, dayIndex) => (
// //             <Grid item xs={12} key={dayIndex}>
// //               <Typography variant="h6">Day {day.day}</Typography>
// //               <FormControlLabel
// //                 control={
// //                   <Switch
// //                     checked={day.isExercise}
// //                     onChange={(e) => {
// //                       setWorkout(prevWorkout => ({
// //                         ...prevWorkout,
// //                         [workoutType]: {
// //                           ...prevWorkout[workoutType],
// //                           [currentLevel]: {
// //                             ...prevWorkout[workoutType][currentLevel],
// //                             days: prevWorkout[workoutType][currentLevel].days.map((d, i) => 
// //                               i === dayIndex ? { ...d, isExercise: e.target.checked } : d
// //                             )
// //                           }
// //                         }
// //                       }));
// //                     }}
// //                   />
// //                 }
// //                 label={day.isExercise ? "Exercise" : "Rest"}
// //               />
// //               {/* Conditionally Render Inputs */}
// //               {day.isExercise ? (
// //                 <>
// //                   <TextField
// //                     fullWidth
// //                     label="Estimated Time"
// //                     value={day.EstimatedTime}
// //                     onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].EstimatedTime`, value: e.target.value } })}
// //                   />
// //                   <TextField
// //                     fullWidth
// //                     label="Focus"
// //                     value={day.Focus}
// //                     onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Focus`, value: e.target.value } })}
// //                   />
// //                   <Typography variant="body1">Mindfulness</Typography>
// //                   <TextField
// //                     fullWidth
// //                     label="Duration"
// //                     value={day.Mindfulness[0]?.Duration || ''}
// //                     onChange={(e) => handleChange({ target: { name: `days[${dayIndex}].Mindfulness[0].Duration`, value: e.target.value } })}
// //                   />
// //                   {/* Add more inputs as needed for Mindfulness */}
// //                   {/* Stretch, WarmUp, and Workout sections can be added similarly */}
// //                 </>
// //               ) : (
// //                 <>
// //                   {/* Inputs specific to rest periods */}
// //                   <Typography variant="body2">Rest Day Configuration</Typography>
// //                   {/* Add more inputs for rest configuration */}
// //                 </>
// //               )}
// //             </Grid>
// //           ))}
// //         </Grid>
// //       </DialogContent>
// //       <DialogActions>
// //         <Button onClick={onClose}>Cancel</Button>
// //         <Button onClick={handleSubmit}>Save</Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // export default AddWorkoutDialog;





// import React, { useState } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
//   InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
// } from '@mui/material';
// import { addWorkout, uploadImage } from '../firebase/workoutsService';

// const AddWorkoutDialog = ({ open, onClose }) => {
//     const [workout, setWorkout] = useState({
//         workoutType: 'gymWorkout',
//         gymWorkout: {
//             beginner: { days: [] },
//             intermediate: { days: [] },
//             advanced: { days: [] }
//         },
//         homeWorkout: {
//             beginner: { days: [] },
//             intermediate: { days: [] },
//             advanced: { days: [] }
//         }
//   });

//   const [currentLevel, setCurrentLevel] = useState('beginner');
//   const [currentEquipment, setCurrentEquipment] = useState('');
//   const [currentTargetArea, setCurrentTargetArea] = useState('');

//   const handleWorkoutTypeChange = (event) => {
//     setWorkout(prevWorkout => ({
//       ...prevWorkout,
//       workoutType: event.target.value
//     }));
//   };

//   const handleLevelChange = (event) => {
//     setCurrentLevel(event.target.value);
//   };

//   const handleChange = (event, dayIndex, section) => {
//     const { name, value } = event.target;
//     setWorkout(prevWorkout => ({
//       ...prevWorkout,
//       gymWorkout: {
//         ...prevWorkout.gymWorkout,
//         [currentLevel]: {
//           ...prevWorkout.gymWorkout[currentLevel],
//           days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
//             index === dayIndex
//               ? { ...day, [section]: { ...day[section], [name]: value } }
//               : day
//           )
//         }
//       }
//     }));
//   };

//   const handleAddDay = () => {
//     setWorkout(prevWorkout => ({
//       ...prevWorkout,
//       gymWorkout: {
//         ...prevWorkout.gymWorkout,
//         [currentLevel]: {
//           ...prevWorkout.gymWorkout[currentLevel],
//           days: [
//             ...prevWorkout.gymWorkout[currentLevel].days,
//             {
//               day: prevWorkout.gymWorkout[currentLevel].days.length + 1,
//               EquipmentNeeded: [],
//               day1ImageURL: "",
//               EstimatedTime: "",
//               Focus: "",
//               Mindfulness: [],
//               Stretch: [],
//               TargetAreas: [],
//               WarmUp: [],
//               Workout: [],
//               isExercise: true
//             }
//           ]
//         }
//       }
//     }));
//   };

//   const handleAddExercise = (dayIndex, section) => {
//     setWorkout(prevWorkout => ({
//       ...prevWorkout,
//       gymWorkout: {
//         ...prevWorkout.gymWorkout,
//         [currentLevel]: {
//           ...prevWorkout.gymWorkout[currentLevel],
//           days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
//             index === dayIndex
//               ? { ...day, [section]: [...day[section], { Exercise: "", Duration: "", Reps: "", Rest: "", Tempo: "", gifURL: "" }] }
//               : day
//           )
//         }
//       }
//     }));
//   };

//   const handleAddEquipment = (dayIndex) => {
//     if (currentEquipment) {
//       setWorkout(prevWorkout => ({
//         ...prevWorkout,
//         gymWorkout: {
//           ...prevWorkout.gymWorkout,
//           [currentLevel]: {
//             ...prevWorkout.gymWorkout[currentLevel],
//             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
//               index === dayIndex
//                 ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
//                 : day
//             )
//           }
//         }
//       }));
//       setCurrentEquipment('');
//     }
//   };

//   const handleAddTargetArea = (dayIndex) => {
//     if (currentTargetArea) {
//       setWorkout(prevWorkout => ({
//         ...prevWorkout,
//         gymWorkout: {
//           ...prevWorkout.gymWorkout,
//           [currentLevel]: {
//             ...prevWorkout.gymWorkout[currentLevel],
//             days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
//               index === dayIndex
//                 ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
//                 : day
//             )
//           }
//         }
//       }));
//       setCurrentTargetArea('');
//     }
//   };

//   const handleImageUpload = async (event, dayIndex) => {
//     const file = event.target.files[0];
//     if (file) {
//       try {
//         const imageUrl = await uploadImage(file);
//         setWorkout(prevWorkout => ({
//           ...prevWorkout,
//           gymWorkout: {
//             ...prevWorkout.gymWorkout,
//             [currentLevel]: {
//               ...prevWorkout.gymWorkout[currentLevel],
//               days: prevWorkout.gymWorkout[currentLevel].days.map((day, index) => 
//                 index === dayIndex
//                   ? { ...day, day1ImageURL: imageUrl }
//                   : day
//               )
//             }
//           }
//         }));
//       } catch (error) {
//         console.error("Error uploading image:", error);
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       await addWorkout(workout);
//       onClose();
//     } catch (error) {
//       console.error("Error adding workout:", error);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
//       <DialogTitle>Add New Workout</DialogTitle>
//       <DialogContent>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <FormControl fullWidth>
//               <InputLabel>Workout Type</InputLabel>
//               <Select
//                 value={workout.workoutType}
//                 onChange={handleWorkoutTypeChange}
//               >
//                 <MenuItem value="gymWorkout">Gym Workout</MenuItem>
//                 <MenuItem value="homeWorkout">Home Workout</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           {workout.workoutType === 'gymWorkout' && (
//             <>
//               <Grid item xs={12}>
//                 <FormControl fullWidth>
//                   <InputLabel>Level</InputLabel>
//                   <Select
//                     value={currentLevel}
//                     onChange={handleLevelChange}
//                   >
//                     <MenuItem value="beginner">Beginner</MenuItem>
//                     <MenuItem value="intermediate">Intermediate</MenuItem>
//                     <MenuItem value="advanced">Advanced</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12}>
//                 <Button onClick={handleAddDay}>Add Day</Button>
//               </Grid>
//       {workout.gymWorkout[currentLevel].days.map((day, dayIndex) => (
//         <Grid item xs={12} key={dayIndex}>
//           <Typography variant="h6">Day {day.day}</Typography>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={day.isExercise}
//                 onChange={(e) => {
//                   setWorkout(prevWorkout => ({
//                     ...prevWorkout,
//                     gymWorkout: {
//                       ...prevWorkout.gymWorkout,
//                       [currentLevel]: {
//                         ...prevWorkout.gymWorkout[currentLevel],
//                         days: prevWorkout.gymWorkout[currentLevel].days.map((d, i) => 
//                           i === dayIndex ? { ...d, isExercise: e.target.checked } : d
//                         )
//                       }
//                     }
//                   }));
//                 }}
//               />
//             }
//             label={day.isExercise ? "Exercise" : "Rest"}
//           />
//           <TextField
//             fullWidth
//             label="Estimated Time"
//             value={day.EstimatedTime}
//             onChange={(e) => handleChange(e, dayIndex, 'EstimatedTime')}
//           />
//           <TextField
//             fullWidth
//             label="Focus"
//             value={day.Focus}
//             onChange={(e) => handleChange(e, dayIndex, 'Focus')}
//           />
//           <Box display="flex" alignItems="center">
//             <TextField
//               fullWidth
//               label="Equipment Needed"
//               value={currentEquipment}
//               onChange={(e) => setCurrentEquipment(e.target.value)}
//             />
//             <Button onClick={() => handleAddEquipment(dayIndex)}>Add</Button>
//           </Box>
//           <Box mt={1}>
//             {day.EquipmentNeeded.map((equipment, index) => (
//               <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
//             ))}
//           </Box>
//           <Box display="flex" alignItems="center">
//             <TextField
//               fullWidth
//               label="Target Areas"
//               value={currentTargetArea}
//               onChange={(e) => setCurrentTargetArea(e.target.value)}
//             />
//             <Button onClick={() => handleAddTargetArea(dayIndex)}>Add</Button>
//           </Box>
//           <Box mt={1}>
//             {day.TargetAreas.map((area, index) => (
//               <Chip key={index} label={area} onDelete={() => {/* Handle delete */}} style={{ margin: 4 }} />
//             ))}
//           </Box>
//           <input
//             accept="image/*"
//             style={{ display: 'none' }}
//             id={`image-upload-${dayIndex}`}
//             type="file"
//             onChange={(e) => handleImageUpload(e, dayIndex)}
//           />
//           <label htmlFor={`image-upload-${dayIndex}`}>
//             <Button variant="contained" component="span">
//               Upload Image/GIF
//             </Button>
//           </label>
//           {day.day1ImageURL && (
//             <img src={day.day1ImageURL} alt="Uploaded" style={{ width: 100, height: 100, objectFit: 'cover' }} />
//           )}

//           {day.isExercise ? (
//             <>
//               {/* Mindfulness Section */}
//               <Typography variant="subtitle1">Mindfulness</Typography>
//               <Button onClick={() => handleAddExercise(dayIndex, 'Mindfulness')}>Add Mindfulness Exercise</Button>
//               {day.Mindfulness.map((exercise, index) => (
//                 <Box key={index}>
//                   <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Exercise`)} />
//                   <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Duration`)} />
//                   {/* Add GIF upload for mindfulness */}
//                 </Box>
//               ))}

//               {/* Stretch Section */}
//               <Typography variant="subtitle1">Stretch</Typography>
//               <Button onClick={() => handleAddExercise(dayIndex, 'Stretch')}>Add Stretch Exercise</Button>
//               {day.Stretch.map((exercise, index) => (
//                 <Box key={index}>
//                   <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Exercise`)} />
//                   <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Duration`)} />
//                   {/* Add GIF upload for stretch */}
//                 </Box>
//               ))}

//               {/* WarmUp Section */}
//               <Typography variant="subtitle1">Warm Up</Typography>
//               <Button onClick={() => handleAddExercise(dayIndex, 'WarmUp')}>Add Warm Up Exercise</Button>
//               {day.WarmUp.map((exercise, index) => (
//                 <Box key={index}>
//                   <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Exercise`)} />
//                   <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Duration`)} />
//                   <TextField label="Reps" value={exercise.Reps} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Reps`)} />
//                   {/* Add GIF upload for warm up */}
//                 </Box>
//               ))}

//               {/* Workout Section */}
//               <Typography variant="subtitle1">Workout</Typography>
//               <Button onClick={() => handleAddExercise(dayIndex, 'Workout')}>Add Workout Exercise</Button>
//               {day.Workout.map((set, setIndex) => (
//                 <Box key={setIndex}>
//                   <Typography variant="subtitle2">Set {set.Set}</Typography>
//                   {set.Exercises.map((exercise, exerciseIndex) => (
//                     <Box key={exerciseIndex}>
//                       <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Exercise`)} />
//                       <TextField label="Reps" value={exercise.Reps} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Reps`)} />
//                       <TextField label="Rest" value={exercise.Rest} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Rest`)} />
//                       <TextField label="Tempo" value={exercise.Tempo} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Tempo`)} />
//                       {/* Add GIF upload for workout */}
//                     </Box>
//                   ))}
//                 </Box>
//               ))}
//             </>
//           ) : (
//             <TextField
//               fullWidth
//               label="Rest Day Description"
//               value={day.restDescription}
//               onChange={(e) => handleChange(e, dayIndex, 'restDescription')}
//             />
//           )}
//         </Grid>
//       ))}
//     </>
//   )}
//           {/* {workout.workoutType === 'homeWorkout' && (
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={4}
//                 label="Home Workout Description"
//                 value={workout.homeWorkout}
//                 onChange={(e) => setWorkout(prevWorkout => ({ ...prevWorkout, homeWorkout: e.target.value }))}
//               />
//             </Grid>
//           )} */}
//         </Grid>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddWorkoutDialog












import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl,
    InputLabel, Select, MenuItem, Box, Chip, Typography, Switch, FormControlLabel
} from '@mui/material';
import { addWorkout, uploadImage } from '../firebase/workoutsService';

// Reusable GIF Image Component
const GifImage = ({ src, alt, width = 100, height = 100 }) => (
    <img src={src} alt={alt} style={{ width, height, objectFit: 'cover' }} />
);

const AddWorkoutDialog = ({ open, onClose }) => {
    const [workout, setWorkout] = useState({
        workoutType: 'gymWorkout',
        level: 'beginner',
        gymWorkout: {
            beginner: { days: [] },
            intermediate: { days: [] },
            advanced: { days: [] }
        },
        homeWorkout: {
            beginner: { days: [] },
            intermediate: { days: [] },
            advanced: { days: [] }
        }
    });

    const [currentEquipment, setCurrentEquipment] = useState('');
    const [currentTargetArea, setCurrentTargetArea] = useState('');

    const handleWorkoutTypeChange = (event) => {
        setWorkout(prevWorkout => ({
            ...prevWorkout,
            workoutType: event.target.value
        }));
    };

    const handleLevelChange = (event) => {
        setWorkout(prevWorkout => ({
            ...prevWorkout,
            level: event.target.value
        }));
    };

    const handleChange = (event, dayIndex, section) => {
        const { name, value } = event.target;
        setWorkout(prevWorkout => ({
            ...prevWorkout,
            [prevWorkout.workoutType]: {
                ...prevWorkout[prevWorkout.workoutType],
                [prevWorkout.level]: {
                    ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
                    days: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.map((day, index) =>
                        index === dayIndex
                            ? { ...day, [section]: { ...day[section], [name]: value } }
                            : day
                    )
                }
            }
        }));
    };

    // const handleChange = (event, dayIndex, section) => {
    //     const { value } = event.target;
    //     setWorkout(prevWorkout => ({
    //       ...prevWorkout,
    //       [prevWorkout.workoutType]: {
    //         ...prevWorkout[prevWorkout.workoutType],
    //         [prevWorkout.level]: {
    //           ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
    //           days: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.map((day, index) =>
    //             index === dayIndex
    //               ? { ...day, [section]: value }
    //               : day
    //           )
    //         }
    //       }
    //     }));
    //   };
      

    const handleAddDay = () => {
        setWorkout(prevWorkout => ({
            ...prevWorkout,
            [prevWorkout.workoutType]: {
                ...prevWorkout[prevWorkout.workoutType],
                [prevWorkout.level]: {
                    ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
                    days: [
                        ...prevWorkout[prevWorkout.workoutType][prevWorkout.level].days,
                        {
                            day: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.length + 1,
                            EquipmentNeeded: [],
                            EstimatedTime: "",
                            Focus: "",
                            Mindfulness: [],
                            Stretch: [],
                            TargetAreas: [],
                            WarmUp: [],
                            Workout: [],
                            isExercise: true,
                            imageUrl: ""
                        }
                    ]
                }
            }
        }));


    };


    const handleAddEquipment = (dayIndex) => {
        if (currentEquipment) {
            setWorkout(prevWorkout => ({
                ...prevWorkout,
                [prevWorkout.workoutType]: {
                    ...prevWorkout[prevWorkout.workoutType],
                    [prevWorkout.level]: {
                        ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
                        days: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.map((day, index) =>
                            index === dayIndex
                                ? { ...day, EquipmentNeeded: [...day.EquipmentNeeded, currentEquipment] }
                                : day
                        )
                    }
                }
            }));
            setCurrentEquipment('');
        }
    };

    const handleAddTargetArea = (dayIndex) => {
        if (currentTargetArea) {
            setWorkout(prevWorkout => ({
                ...prevWorkout,
                [prevWorkout.workoutType]: {
                    ...prevWorkout[prevWorkout.workoutType],
                    [prevWorkout.level]: {
                        ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
                        days: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.map((day, index) =>
                            index === dayIndex
                                ? { ...day, TargetAreas: [...day.TargetAreas, currentTargetArea] }
                                : day
                        )
                    }
                }
            }));
            setCurrentTargetArea('');
        }
    };

    const handleImageUpload = async (event, dayIndex) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setWorkout(prevWorkout => ({
                    ...prevWorkout,
                    [prevWorkout.workoutType]: {
                        ...prevWorkout[prevWorkout.workoutType],
                        [prevWorkout.level]: {
                            ...prevWorkout[prevWorkout.workoutType][prevWorkout.level],
                            days: prevWorkout[prevWorkout.workoutType][prevWorkout.level].days.map((day, index) =>
                                index === dayIndex
                                    ? { ...day, imageUrl: imageUrl }
                                    : day
                            )
                        }
                    }
                }));
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            await addWorkout(workout);
            onClose();
        } catch (error) {
            console.error("Error adding workout:", error);
        }
    };

    const renderExerciseInputs = (day, dayIndex) => (
        <>
            <TextField
                fullWidth
                label="Estimated Time"
                value={day.EstimatedTime}
                onChange={(e) => handleChange(e, dayIndex, 'EstimatedTime')}
            />
            <TextField
                fullWidth
                label="Focus"
                value={day.Focus}
                onChange={(e) => handleChange(e, dayIndex, 'Focus')}
            />
            <Box display="flex" alignItems="center">
                <TextField
                    fullWidth
                    label="Equipment Needed"
                    value={currentEquipment}
                    onChange={(e) => setCurrentEquipment(e.target.value)}
                />
                <Button onClick={() => handleAddEquipment(dayIndex)}>Add</Button>
            </Box>
            <Box mt={1}>
                {day.EquipmentNeeded.map((equipment, index) => (
                    <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */ }} style={{ margin: 4 }} />
                ))}
            </Box>
            <Box display="flex" alignItems="center">
                <TextField
                    fullWidth
                    label="Target Areas"
                    value={currentTargetArea}
                    onChange={(e) => setCurrentTargetArea(e.target.value)}
                />
                <Button onClick={() => handleAddTargetArea(dayIndex)}>Add</Button>
            </Box>
            <Box mt={1}>
                {day.TargetAreas.map((area, index) => (
                    <Chip key={index} label={area} onDelete={() => {/* Handle delete */ }} style={{ margin: 4 }} />
                ))}
            </Box>
            {/* Mindfulness Section */}
            <Typography variant="subtitle1">Mindfulness</Typography>
            {day.Mindfulness.map((item, index) => (
                <Box key={index} mt={1}>
                    <TextField
                        label="Exercise"
                        value={item.Exercise}
                        onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Exercise`)}
                    />
                    <TextField
                        label="Duration"
                        value={item.Duration}
                        onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Duration`)}
                    />
                    <input
                        accept="image/gif"
                        style={{ display: 'none' }}
                        id={`mindfulness-gif-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleImageUpload(e, dayIndex, `Mindfulness[${index}].gifURL`)}
                    />
                    <label htmlFor={`mindfulness-gif-${dayIndex}-${index}`}>
                        <Button component="span">Upload GIF</Button>
                    </label>
                    {item.gifURL && <GifImage src={item.gifURL} alt="Mindfulness Exercise" />}
                </Box>
            ))}
            <Button onClick={() => {/* Add new Mindfulness item */ }}>Add Mindfulness Exercise</Button>

            {/* Stretch Section */}
            <Typography variant="subtitle1">Stretch</Typography>
            {day.Stretch.map((item, index) => (
                <Box key={index} mt={1}>
                    <TextField
                        label="Exercise"
                        value={item.Exercise}
                        onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Exercise`)}
                    />
                    <TextField
                        label="Duration"
                        value={item.Duration}
                        onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Duration`)}
                    />
                    <input
                        accept="image/gif"
                        style={{ display: 'none' }}
                        id={`stretch-gif-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleImageUpload(e, dayIndex, `Stretch[${index}].gifURL`)}
                    />
                    <label htmlFor={`stretch-gif-${dayIndex}-${index}`}>
                        <Button component="span">Upload GIF</Button>
                    </label>
                    {item.gifURL && <GifImage src={item.gifURL} alt="Stretch Exercise" />}
                </Box>
            ))}
            <Button onClick={() => {/* Add new Stretch item */ }}>Add Stretch Exercise</Button>

            {/* Warm Up Section */}
            <Typography variant="subtitle1">Warm Up</Typography>
            {day.WarmUp.map((item, index) => (
                <Box key={index} mt={1}>
                    <TextField
                        label="Exercise"
                        value={item.Exercise}
                        onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Exercise`)}
                    />
                    <TextField
                        label="Duration"
                        value={item.Duration}
                        onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Duration`)}
                    />
                    <TextField
                        label="Reps"
                        value={item.Reps}
                        onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Reps`)}
                    />
                    <input
                        accept="image/gif"
                        style={{ display: 'none' }}
                        id={`warmup-gif-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleImageUpload(e, dayIndex, `WarmUp[${index}].gifURL`)}
                    />
                    <label htmlFor={`warmup-gif-${dayIndex}-${index}`}>
                        <Button component="span">Upload GIF</Button>
                    </label>
                    {item.gifURL && <GifImage src={item.gifURL} alt="Warm Up Exercise" />}
                </Box>
            ))}
            <Button onClick={() => {/* Add new Warm Up item */ }}>Add Warm Up Exercise</Button>

            {/* Workout Section */}
            <Typography variant="subtitle1">Workout</Typography>
            {day.Workout.map((set, setIndex) => (
                <Box key={setIndex} mt={1}>
                    <Typography variant="subtitle2">Set {set.Set}</Typography>
                    {set.Exercises.map((exercise, exerciseIndex) => (
                        <Box key={exerciseIndex} mt={1}>
                            <TextField
                                label="Exercise"
                                value={exercise.Exercise}
                                onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Exercise`)}
                            />
                            <TextField
                                label="Reps"
                                value={exercise.Reps}
                                onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Reps`)}
                            />
                            <TextField
                                label="Rest"
                                value={exercise.Rest}
                                onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Rest`)}
                            />
                            <TextField
                                label="Tempo"
                                value={exercise.Tempo}
                                onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Tempo`)}
                            />
                            <input
                                accept="image/gif"
                                style={{ display: 'none' }}
                                id={`workout-gif-${dayIndex}-${setIndex}-${exerciseIndex}`}
                                type="file"
                                onChange={(e) => handleImageUpload(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].gifURL`)}
                            />
                            <label htmlFor={`workout-gif-${dayIndex}-${setIndex}-${exerciseIndex}`}>
                                <Button component="span">Upload GIF</Button>
                            </label>
                            {exercise.gifURL && <GifImage src={exercise.gifURL} alt="Workout Exercise" />}
                        </Box>
                    ))}
                    <Button onClick={() => {/* Add new Exercise to this Set */ }}>Add Exercise to Set</Button>
                </Box>
            ))}
            <Button onClick={() => {/* Add new Workout Set */ }}>Add Workout Set</Button>
        </>
    );

    const renderRestInputs = (day, dayIndex) => (
        <TextField
            fullWidth
            label="Rest Description"
            value={day.restDescription || ""}
            onChange={(e) => handleChange(e, dayIndex, 'restDescription')}
        />
    );


    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Add New Workout</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Workout Type</InputLabel>
                            <Select
                                value={workout.workoutType}
                                onChange={handleWorkoutTypeChange}
                            >
                                <MenuItem value="gymWorkout">Gym Workout</MenuItem>
                                <MenuItem value="homeWorkout">Home Workout</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Level</InputLabel>
                            <Select
                                value={workout.level}
                                onChange={handleLevelChange}
                            >
                                <MenuItem value="beginner">Beginner</MenuItem>
                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                <MenuItem value="advanced">Advanced</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={handleAddDay}>Add Day</Button>
                    </Grid>


                    {workout[workout.workoutType][workout.level].days.map((day, dayIndex) => (
                        <Grid item xs={12} key={dayIndex}>
                            <Typography variant="h6">Day {day.day}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={day.isExercise}
                                        onChange={(e) => {
                                            setWorkout(prevWorkout => {
                                                const currentWorkout = prevWorkout[prevWorkout.workoutType];
                                                const updatedDays = currentWorkout[prevWorkout.level].days.map((d, i) =>
                                                    i === dayIndex ? { ...d, isExercise: e.target.checked } : d
                                                );

                                                return {
                                                    ...prevWorkout,
                                                    [prevWorkout.workoutType]: {
                                                        ...prevWorkout[prevWorkout.workoutType],
                                                        [prevWorkout.level]: {
                                                            ...currentWorkout[prevWorkout.level],
                                                            days: updatedDays
                                                        }
                                                    }
                                                };
                                            });
                                        }}
                                    />
                                }
                                label={day.isExercise ? "Exercise" : "Rest"}
                            />
                            {/* <TextField
                    fullWidth
                    label="Estimated Time"
                    value={day.EstimatedTime}
                    onChange={(e) => handleChange(e, dayIndex, 'EstimatedTime')}
                  />
                  <TextField
                    fullWidth
                    label="Focus"
                    value={day.Focus}
                    onChange={(e) => handleChange(e, dayIndex, 'Focus')}
                  />
                  <Box display="flex" alignItems="center">
                    <TextField
                      fullWidth
                      label="Equipment Needed"
                      value={currentEquipment}
                      onChange={(e) => setCurrentEquipment(e.target.value)}
                    />
                    <Button onClick={() => handleAddEquipment(dayIndex)}>Add</Button>
                  </Box> */}

                            <TextField
                                fullWidth
                                label="Estimated Time"
                                value={day.EstimatedTime}
                                onChange={(e) => handleChange(e, dayIndex, 'EstimatedTime')}
                            />
                            <TextField
                                fullWidth
                                label="Focus"
                                value={day.Focus}
                                onChange={(e) => handleChange(e, dayIndex, 'Focus')}
                            />
                            <Box display="flex" alignItems="center">
                                <TextField
                                    fullWidth
                                    label="Equipment Needed"
                                    value={currentEquipment}
                                    onChange={(e) => setCurrentEquipment(e.target.value)}
                                />
                                <Button onClick={() => handleAddEquipment(dayIndex)}>Add</Button>
                            </Box>
                            <Box mt={1}>
                                {day.EquipmentNeeded.map((equipment, index) => (
                                    <Chip key={index} label={equipment} onDelete={() => {/* Handle delete */ }} style={{ margin: 4 }} />
                                ))}
                            </Box>
                            <Box display="flex" alignItems="center">
                                <TextField
                                    fullWidth
                                    label="Target Areas"
                                    value={currentTargetArea}
                                    onChange={(e) => setCurrentTargetArea(e.target.value)}
                                />
                                <Button onClick={() => handleAddTargetArea(dayIndex)}>Add</Button>
                            </Box>
                            <Box mt={1}>
                                {day.TargetAreas.map((area, index) => (
                                    <Chip key={index} label={area} onDelete={() => {/* Handle delete */ }} style={{ margin: 4 }} />
                                ))}
                            </Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id={`image-upload-${dayIndex}`}
                                type="file"
                                onChange={(e) => handleImageUpload(e, dayIndex)}
                            />
                            <label htmlFor={`image-upload-${dayIndex}`}>
                                <Button variant="contained" component="span">
                                    Upload Image/GIF
                                </Button>
                            </label>
                            {day.day1ImageURL && (
                                <img src={day.day1ImageURL} alt="Uploaded" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                            )}

                            {day.isExercise ? (
                                <>
                                    {/* Mindfulness Section */}
                                    <Typography variant="subtitle1">Mindfulness</Typography>
                                    <Button onClick={() => handleAddExercise(dayIndex, 'Mindfulness')}>Add Mindfulness Exercise</Button>
                                    {day.Mindfulness.map((exercise, index) => (
                                        <Box key={index}>
                                            <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Exercise`)} />
                                            <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `Mindfulness[${index}].Duration`)} />
                                            {/* Add GIF upload for mindfulness */}
                                        </Box>
                                    ))}

                                    {/* Stretch Section */}
                                    <Typography variant="subtitle1">Stretch</Typography>
                                    <Button onClick={() => handleAddExercise(dayIndex, 'Stretch')}>Add Stretch Exercise</Button>
                                    {day.Stretch.map((exercise, index) => (
                                        <Box key={index}>
                                            <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Exercise`)} />
                                            <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `Stretch[${index}].Duration`)} />
                                            {/* Add GIF upload for stretch */}
                                        </Box>
                                    ))}

                                    {/* WarmUp Section */}
                                    <Typography variant="subtitle1">Warm Up</Typography>
                                    <Button onClick={() => handleAddExercise(dayIndex, 'WarmUp')}>Add Warm Up Exercise</Button>
                                    {day.WarmUp.map((exercise, index) => (
                                        <Box key={index}>
                                            <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Exercise`)} />
                                            <TextField label="Duration" value={exercise.Duration} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Duration`)} />
                                            <TextField label="Reps" value={exercise.Reps} onChange={(e) => handleChange(e, dayIndex, `WarmUp[${index}].Reps`)} />
                                            {/* Add GIF upload for warm up */}
                                        </Box>
                                    ))}

                                    {/* Workout Section */}
                                    <Typography variant="subtitle1">Workout</Typography>
                                    <Button onClick={() => handleAddExercise(dayIndex, 'Workout')}>Add Workout Exercise</Button>
                                    {day.Workout.map((set, setIndex) => (
                                        <Box key={setIndex}>
                                            <Typography variant="subtitle2">Set {set.Set}</Typography>
                                            {set.Exercises.map((exercise, exerciseIndex) => (
                                                <Box key={exerciseIndex}>
                                                    <TextField label="Exercise" value={exercise.Exercise} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Exercise`)} />
                                                    <TextField label="Reps" value={exercise.Reps} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Reps`)} />
                                                    <TextField label="Rest" value={exercise.Rest} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Rest`)} />
                                                    <TextField label="Tempo" value={exercise.Tempo} onChange={(e) => handleChange(e, dayIndex, `Workout[${setIndex}].Exercises[${exerciseIndex}].Tempo`)} />
                                                    {/* Add GIF upload for workout */}
                                                </Box>
                                            ))}
                                        </Box>
                                    ))}
                                </>
                            ) : (
                                <TextField
                                    fullWidth
                                    label="Rest Day Description"
                                    value={day.restDescription}
                                    onChange={(e) => handleChange(e, dayIndex, 'restDescription')}
                                />
                            )}
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    )
};

export default AddWorkoutDialog