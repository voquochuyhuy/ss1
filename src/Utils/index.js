import React from 'react';
export const If = ({ component: Component, condition, propsForComponent }) => {
    if (!propsForComponent)
        return condition ? <Component /> : null;
    return condition ? <Component {...propsForComponent} /> : null;
}