import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { positionService } from "../services/position.service";
import { Position } from "../../../types/operations.types";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Trash2, Edit2, Plus, X, ChevronLeft } from "lucide-react-native";
import { Card } from "react-native-paper";
import Toast from "react-native-toast-message";

export function ManagePositionsScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { semesterId } = route.params;

    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchPositions();
    }, [semesterId]);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const data = await positionService.getBySemesterId(semesterId);
            setPositions(data);
        } catch (error) {
            console.error(error);
            Toast.show({ type: "error", text1: "Error al cargar cargos" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Toast.show({ type: "error", text1: "El nombre es obligatorio" });
            return;
        }

        try {
            if (isEditing && editingId) {
                await positionService.update(editingId, { name, description });
                Toast.show({ type: "success", text1: "Cargo actualizado" });
            } else {
                await positionService.create({ semesterId, name, description });
                Toast.show({ type: "success", text1: "Cargo creado" });
            }
            resetForm();
            fetchPositions();
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error.response?.data?.message || "Ocurrió un error"
            });
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Cargo",
            "¿Estás seguro? Esto podría afectar actividades que usen este cargo.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await positionService.delete(id);
                            Toast.show({ type: "success", text1: "Cargo eliminado" });
                            fetchPositions();
                        } catch (error) {
                            Toast.show({ type: "error", text1: "Error al eliminar" });
                        }
                    },
                },
            ]
        );
    };

    const startEdit = (position: Position) => {
        setIsEditing(true);
        setEditingId(position.id);
        setName(position.name);
        setDescription(position.description || "");
        setShowForm(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setName("");
        setDescription("");
        setShowForm(false);
    };

    const renderItem = ({ item }: { item: Position }) => (
        <Card className="mb-3 bg-white" mode="elevated">
            <Card.Content className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
                    {item.description && (
                        <Text className="text-slate-500 text-sm mt-1">{item.description}</Text>
                    )}
                </View>
                <View className="flex-row gap-4 ml-2">
                    <TouchableOpacity onPress={() => startEdit(item)}>
                        <Edit2 size={20} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-6 py-4 flex-row items-center justify-between bg-white shadow-sm z-10">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">Gestionar Cargos</Text>
                </View>
                {!showForm && (
                    <TouchableOpacity onPress={() => setShowForm(true)}>
                        <Plus size={24} color="#2563EB" />
                    </TouchableOpacity>
                )}
            </View>

            <View className="flex-1 p-4">
                {showForm && (
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-slate-800">
                                {isEditing ? "Editar Cargo" : "Nuevo Cargo"}
                            </Text>
                            <TouchableOpacity onPress={resetForm}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-4">
                            <Input
                                label="Nombre del Cargo"
                                placeholder="Ej. Guía, Cocinero"
                                value={name}
                                onChangeText={setName}
                            />
                            <Input
                                label="Descripción"
                                placeholder="Responsabilidades..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                            <Button
                                title={isEditing ? "Actualizar" : "Crear"}
                                onPress={handleSubmit}
                                disabled={loading}
                            />
                        </View>
                    </View>
                )}

                <FlatList
                    data={positions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        !loading ? (
                            <View className="items-center py-10">
                                <Text className="text-slate-400">No hay cargos definidos.</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
}


