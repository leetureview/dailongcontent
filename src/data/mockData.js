export const mockComments = [
    {
        id: 1,
        person: {
            name: 'Người 1',
            avatar: null,
            color: '#3B82F6'
        },
        content: 'Wow, visual của cặp đôi này đỉnh quá! 😍 Kính Anna làm nổi bật cả outfit luôn ấy. Cả hai trông rất matching và thời trang!',
        type: 'Khen ngợi',
        condition: 'Đạt',
        replyTo: null
    },
    {
        id: 2,
        person: {
            name: 'Người 2',
            avatar: null,
            color: '#10B981'
        },
        content: 'Cho mình xin địa chỉ shop với ạ! Mình cũng muốn mua một cặp kính như vậy cho mình và người yêu 🥰',
        type: 'Hỏi địa chỉ',
        condition: 'Đạt',
        replyTo: {
            id: 1,
            name: 'Người 1'
        }
    },
    {
        id: 3,
        person: {
            name: 'Người 3',
            avatar: null,
            color: '#F59E0B'
        },
        content: 'Hai bạn giống couple trong phim Hàn quá! 💕 Kính Anna có nhiều mẫu không ạ? Mình thấy mẫu này rất hợp với mặt trái xoan.',
        type: 'Khen ngợi',
        condition: 'Đạt',
        replyTo: null
    },
    {
        id: 4,
        person: {
            name: 'Người 4',
            avatar: null,
            color: '#8B5CF6'
        },
        content: 'Kính đẹp quá! Chất lượng kính thế nào vậy ạ? Có chống UV không? Mình đang tìm kính vừa thời trang vừa bảo vệ mắt ý.',
        type: 'Hỏi thông tin',
        condition: 'Đạt',
        replyTo: null
    },
    {
        id: 5,
        person: {
            name: 'Người 5',
            avatar: null,
            color: '#EC4899'
        },
        content: 'Save lại để cuối tuần rủ bạn trai đi mua! 📌 Cặp kính couple này xinh quá, giá cả thế nào ạ shop?',
        type: 'Hỏi giá',
        condition: 'Đạt',
        replyTo: {
            id: 3,
            name: 'Người 3'
        }
    }
];
