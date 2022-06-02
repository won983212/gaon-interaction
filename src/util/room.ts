/**
 * room 넘버가 비정상이면 undefined를 반환한다.
 * 정상이면 같은 room 넘버를 반환한다.
 */
export function getValidatedRoom(room?: number): number | undefined {
    return room && (room >= 0) ? room : undefined;
}

/**
 * 아무 channel에도 들어가있지 않은 경우의 room id를 반환한다.
 */
export function getEmptyRoomId() {
    return -1;
}