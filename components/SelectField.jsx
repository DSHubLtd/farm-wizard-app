import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';

const SelectField = ({ title, options, selectedValue, handleValueChange, otherStyles }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown visibility

    const handleSearch = (text) => {
        setSearchText(text);
        setFilteredOptions(options.filter(option =>
            option.label.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

            {/* Dropdown Box */}
            <TouchableOpacity
                onPress={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-dotted border-secondary flex-row justify-between items-center"
            >
                {/* <Image source={{ uri: item.flag }} className="w-6 h-4 mr-2 rounded" /> */}
                <Text className="text-white font-psemibold text-base">
                    {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : "Select an option"}
                </Text>
                {dropdownOpen ? (<ArrowUp size={35} color="#ffffff" />) : (<ArrowDown size={35} color="#ffffff" />)}

            </TouchableOpacity>

            {/* Dropdown List - Visible Only When Open */}
            {dropdownOpen && (
                <View className="w-full bg-gray-800 p-2 rounded-lg mt-2">
                    <TextInput
                        className="w-full text-white font-psemibold text-base mb-2"
                        placeholder="Search..."
                        placeholderTextColor="#7B7B8B"
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                    <ScrollView className="max-h-[200px]">
                        {filteredOptions.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                onPress={() => {
                                    handleValueChange(item.value);
                                    setSearchText(item.label);
                                    setDropdownOpen(false);
                                }}
                                className="py-2 px-4 bg-gray-700 rounded-lg mb-2"
                            >
                                <Text className="text-white font-psemibold">{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    handleValueChange(item.value);
                                    setSearchText(item.label); // Update display text
                                    setDropdownOpen(false); // Close dropdown after selection
                                }}
                                className="py-2 px-4 bg-gray-700 rounded-lg mb-2"
                            >
                                <Text className="text-white font-psemibold">{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    /> */}
                </View>
            )}
        </View>
    );
};

export default SelectField;

export const CustomSelectField = ({ title, options, selectedValue, handleValueChange, otherStyles }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility

    const handleSearch = (text) => {
        setSearchText(text);
        setFilteredOptions(options.filter(option =>
            option.label.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

            {/* Touchable area for triggering Modal */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-dotted border-secondary flex-row justify-between items-center"
            >
                <Text className="text-white font-psemibold text-base">
                    {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : "Select an option"}
                </Text>
                <ArrowDown size={35} color="#ffffff" />
            </TouchableOpacity>

            {/* Modal for displaying the dropdown */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-white/20 bg-opacity-5">
                    <View className="w-4/5 bg-gray-600 p-4 rounded-lg">
                        {/* Search Input */}
                        <TextInput
                            className="w-full text-white font-psemibold text-base mb-2"
                            placeholder="Search..."
                            placeholderTextColor="#7B7B8B"
                            value={searchText}
                            onChangeText={handleSearch}
                        />

                        {/* Scrollable List of Options */}
                        <ScrollView className="max-h-[200px]">
                            {filteredOptions.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => {
                                        handleValueChange(item.value);
                                        setSearchText(item.label);
                                        setModalVisible(false); // Close modal after selection
                                    }}
                                    className="py-2 px-4 bg-gray-700 rounded-lg mb-2"
                                >
                                    <Text className="text-white font-psemibold">{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="mt-4 bg-red-500 px-4 py-2 rounded-full"
                        >
                            <Text className="text-white text-center">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

