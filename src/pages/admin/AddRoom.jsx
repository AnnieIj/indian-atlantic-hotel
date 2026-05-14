import React, { useState } from "react";
import axios from "axios";

const AddRoom = () => {

    const [formData, setFormData] = useState({
        roomNumber: "",
        name: "",
        type: "",
        description: "",
        price: "",
        capacity: "",
        status: "available",
        image: "",
        amenities: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            const res = await axios.post(
                "https://indian-atlantichotelbackend.onrender.com/rooms",
                {
                    ...formData,
                    price: Number(formData.price),
                    capacity: Number(formData.capacity),
                    amenities: formData.amenities.split(",")
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(res.data);

            setMessage("Room added successfully!");

        } catch (err) {

            console.log(err.response?.data || err.message);

            setMessage("Failed to add room");

        }
    };

    return (
        <div style={{ padding: "30px" }}>

            <h2>Add Room</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="roomNumber"
                    placeholder="Room Number"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="name"
                    placeholder="Room Name"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="type"
                    placeholder="Room Type"
                    onChange={handleChange}
                />

                <br /><br />

                <textarea
                    name="description"
                    placeholder="Description"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="capacity"
                    placeholder="Capacity"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="text"
                    name="amenities"
                    placeholder="WiFi, AC, TV"
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">
                    Add Room
                </button>

            </form>

            <p>{message}</p>

        </div>
    );
};

export default AddRoom;