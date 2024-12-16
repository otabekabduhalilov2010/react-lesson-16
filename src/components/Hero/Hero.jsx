import React, { useEffect, useState } from 'react';
import './Hero.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Hero = () => {
    // Создание начальных позиций карточек из localStorage или дефолтные позиции
    const getInitialPositions = () => {
        const savedPositions = localStorage.getItem('cardPositions');
        if (savedPositions) {
            return JSON.parse(savedPositions);
        }
        const cardCount = 30; // Количество карточек
        return Array.from({ length: cardCount }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            dx: Math.random() * 2 - 1, // Скорость по оси X
            dy: Math.random() * 2 - 1, // Скорость по оси Y
        }));
    };

    const [positions, setPositions] = useState(getInitialPositions);
    const [explosions, setExplosions] = useState([]); // Для эффектов взрыва

    // Сохраняем позиции в localStorage при их обновлении
    useEffect(() => {
        localStorage.setItem('cardPositions', JSON.stringify(positions));
    }, [positions]);

    // Движение карточек
    useEffect(() => {
        const moveCards = () => {
            setPositions((prev) =>
                prev.map((pos) => {
                    let { x, y, dx, dy } = pos;

                    // Отталкивание от краев экрана
                    if (x + 150 > window.innerWidth || x < 0) dx = -dx;
                    if (y + 100 > window.innerHeight || y < 0) dy = -dy;

                    return {
                        x: x + dx,
                        y: y + dy,
                        dx,
                        dy,
                    };
                })
            );
            requestAnimationFrame(moveCards);
        };

        const animationId = requestAnimationFrame(moveCards);
        return () => cancelAnimationFrame(animationId);
    }, []);

    // Обработчик взрыва
    const handleExplosion = (index, x, y) => {
        // Добавляем новую анимацию взрыва
        setExplosions((prev) => [...prev, { x, y, id: Date.now() }]);

        // Удаляем карточку через небольшую задержку
        setTimeout(() => {
            setPositions((prev) => prev.filter((_, i) => i !== index));
        }, 0);
    };

    // Удаляем взрывы из состояния после завершения анимации
    useEffect(() => {
        const timeoutIds = explosions.map(({ id }) =>
            setTimeout(() => {
                setExplosions((prev) => prev.filter((explosion) => explosion.id !== id));
            }, 1000) // Продолжительность взрыва
        );
        return () => timeoutIds.forEach((id) => clearTimeout(id));
    }, [explosions]);

    // Функция сброса всех карточек
    const resetCards = () => {
        const newPositions = Array.from({ length: 30 }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            dx: Math.random() * 2 - 1, // Скорость по оси X
            dy: Math.random() * 2 - 1, // Скорость по оси Y
        }));
        setPositions(newPositions);
    };

    return (
        <div className="hero-container">
            {positions.map((position, i) => (
                <div
                    key={i}
                    className="rainbow-card"
                    data-aos="flip-up"
                    data-aos-delay={`${i * 50}`}
                    onClick={() => handleExplosion(i, position.x, position.y)}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        transition: 'transform 0.02s linear',
                    }}
                >
                    <h2>Card {i + 1}</h2>
                </div>
            ))}

            {/* Взрывы */}
            {explosions.map((explosion) => (
                <div
                    key={explosion.id}
                    className="explosion"
                    style={{
                        top: explosion.y,
                        left: explosion.x,
                    }}
                />
            ))}


            {/* Кнопка сброса */}
            <button className="reset-button" onClick={resetCards}>
                Сбросить карточки
            </button>
        </div>
    );
};

export default Hero;
