---
title: 'Camera Calibration and Uncalibrated Stereo'
date: 2022-02-12
permalink: /posts/2021/08/camera_calibration_notes/
tags:
  - 3D
  - camera model
---

Notes about Camera Model, Epipolar Geometry, Fundamental Matrix and Triangulation.

> Shree K. Nayar
Columbia University
https://fpcv.cs.columbia.edu
> 

# Linear Camera Model

Forward Imaging Model: 3D to 2D

![截屏2021-12-11 上午10.18.40.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a42bc008-7ca8-4682-8f56-a407c0b3de94/截屏2021-12-11_上午10.18.40.png)

World Coord → Camera Coord: Coordinate Transformation
Camera Coord → Image Coord: Perspective Projection

![截屏2021-12-11 上午11.17.25.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/442c44d8-a98a-47ca-95fa-2d7de999be84/截屏2021-12-11_上午11.17.25.png)

## Perspective Projection

由Forward Imaging model不难发现：

$$
\begin{aligned}
&\frac{x_{i}}{f}=\frac{x_{c}}{z_{c}} \quad  \text { and } \quad \frac{y_{i}}{f}=\frac{y_{c}}{z_{c}} \\
&x_{i}=f \frac{x_{c}}{z_{c}} \quad \text { and } \quad y_{i}=f \frac{y_{c}}{z_{c}}
\end{aligned}
$$

### Image Plane

像平面是由感光元件组成的一个个pixel形成的，下面是像平面原点在中心的情况。

$(f_x, f_y)=(m_xf, m_yf)$ 称为 $x$ 和 $y$ 方向的以像素为单位的焦距

![截屏2021-12-11 上午10.23.16.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7ddc368c-8f54-4056-91f5-fbb64af2673f/截屏2021-12-11_上午10.23.16.png)

通常，像平面的原点并不在中心。

![截屏2021-12-11 上午10.24.47.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/cebfb592-c907-42fb-8587-e45efce9c909/截屏2021-12-11_上午10.24.47.png)

`perspective projection equation`:

Note: it's a **Non-Linear** equation

$$
u=f_x\frac{x_c}{z_c}+o_x \quad v=f_y\frac{y_c}{z_c}+o_y
$$

**Camera's internal geometry** is represented by **Intrinsic parameters** of the camera: $(f_x, f_y,o_x,o_y)$

### Homogeneous Coordinates

**Linear Model(Intrinsic Matrix) for Perspective Projection:**

$$
\left[\begin{array}{l}
u \\
v \\
1
\end{array}\right] =\left[\begin{array}{c}
f_{x} x_{c}+z_{c} o_{x} \\
f_{y} y_{c}+z_{c} o_{y} \\
z_{c}
\end{array}\right]=\left[\begin{array}{cccc}
f_{x} & 0 & o_{x} & 0 \\
0 & f_{y} & o_{y} & 0 \\
0 & 0 & 1 & 0
\end{array}\right]\left[\begin{array}{c}
x_{c} \\
y_{c} \\
z_{c} \\
1
\end{array}\right]
$$

**Calibration Matrix — Upper Right Triangular Matrix**

$$
K = \left[\begin{array}{cccc}
f_{x} & 0 & o_{x} \\
0 & f_{y} & o_{y} \\
0 & 0 & 1
\end{array}\right]
$$

**Intrinsic Matrix**

$$
M_{int}=[K|0]=\left[\begin{array}{cccc}
f_{x} & 0 & o_{x} & 0 \\
0 & f_{y} & o_{y} & 0 \\
0 & 0 & 1 & 0
\end{array}\right]
$$

## World-to-Camera Transformation

![截屏2021-12-11 上午11.08.58.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/39baae53-32d7-45bc-9cf7-cf15d9b17145/截屏2021-12-11_上午11.08.58.png)

### Extrinsic Parameters

> **Camera's Extrinsic Parameters$(R, c_w)$**: **Camera Position** $c_w$ and C**amera Orientation(Rotation)** $R$ in the **World Coordinate frame $\mathcal W$**
> 

![截屏2021-12-11 上午11.05.20.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/315adbda-f27b-4329-aafe-0a84783176bb/截屏2021-12-11_上午11.05.20.png)

Orientation/Rotation Matrix $R$ is **Orthonormal Matrix**

![截屏2021-12-11 上午11.05.55.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1a4414f6-d42f-4655-a973-03f7886d74fb/截屏2021-12-11_上午11.05.55.png)

`World-to-Camera equation`:

$$
\mathbf{x}_{c}=R\left(\mathbf{x}_{w}-\mathbf{c}_{w}\right)=R \mathbf{x}_{w}-R \mathbf{c}_{w}=R \mathbf{x}_{w}+\mathbf{t} \quad \mathbf{t}=-R \mathbf{c}_{w}
$$

### Homogeneous Coordinates

$$
\tilde{\mathbf{x}}_{c}=\left[\begin{array}{c}x_{c} \\ y_{c} \\ z_{c} \\ 1\end{array}\right]=\left[\begin{array}{cccc}r_{11} & r_{12} & r_{13} & t_{x} \\ r_{21} & r_{22} & r_{23} & t_{y} \\ r_{31} & r_{32} & r_{33} & t_{z} \\ 0 & 0 & 0 & 1\end{array}\right]\left[\begin{array}{c}x_{w} \\ y_{w} \\ z_{w} \\ 1\end{array}\right]
$$

$$
\tilde{\mathbf{x}}_{c}=M_{\text {ext }} \tilde{\mathbf{x}}_{w}
$$

**Extrinsic Matrix:**

$$
M_{e x t}=\left[\begin{array}{ll}
R_{3 \times 3} & \mathbf{t} \\
\mathbf{0}_{1 \times 3} & 1
\end{array}\right]=\left[\begin{array}{cccc}
r_{11} & r_{12} & r_{13} & t_{x} \\
r_{21} & r_{22} & r_{23} & t_{y} \\
r_{31} & r_{32} & r_{33} & t_{z} \\
0 & 0 & 0 & 1
\end{array}\right]
$$

## Projection Matrix $P$

Combining the $M_{int}$ and $M_{ext}$, we get the full projection matrix P:

$$
\widetilde{\mathbf{u}}=M_{\text {int }} M_{\text {ext }} \tilde{\mathbf{x}}_{\boldsymbol{w}}=P \tilde{\mathbf{x}}_{\boldsymbol{w}}
$$

$$
\left[\begin{array}{c}\tilde{u} \\ \tilde{v} \\ \tilde{W}\end{array}\right]=\left[\begin{array}{llll}p_{11} & p_{12} & p_{13} & p_{14} \\ p_{21} & p_{22} & p_{23} & p_{24} \\ p_{31} & p_{32} & p_{33} & p_{34}\end{array}\right]\left[\begin{array}{c}x_{w} \\ y_{w} \\ z_{w} \\ 1\end{array}\right]
$$

## Camera Calibration

> "Method to find a camera's internal and external parameters"(estimate the projection matrix)
> 
- Step1: Capture an image of an object with known geometry
    - place world coord frame at one corner of the cube
    - take a single image of the cube
        
        ![截屏2021-12-11 上午11.29.38.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/25ca3618-1911-40b4-9c9d-91e95fdddfe0/截屏2021-12-11_上午11.29.38.png)
        
- Step2: Identify **correspondences** between 3D scene points and image points
- Step3: For each corresponding point $i$ in scene and image, we establish a projection equation
- Step4: Rearranging the terms
- Step5: Solve for $\mathbf P$: $AP =0$
    - Note: Projection Matrix $P$ is defined only up to a scale. So we can set projection matrix to arbitrary scale
    - Actually, we set scale so that $\left\| \mathbf p\right\|^2 = 1$
    
    ![截屏2021-12-11 上午11.36.23.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8ff64532-8c7a-4171-b2e7-d958c5e47f13/截屏2021-12-11_上午11.36.23.png)
    

We want $A\mathbf p$ as close to 0 as possible and $\left\| \mathbf p\right\|^2 = 1$:

$$
\min _{\mathbf{p}}\|A \mathbf{p}\|^{2}\quad \text{such that}\quad \|\mathbf{p}\|^{2}=1
\\
\min _{\mathbf{p}}\left(\mathbf{p}^{T} A^{T} A \mathbf{p}\right) \quad\text{such that} \quad\mathbf{p}^{T} \mathbf{p}=1
$$

Define **Loss function $L(\mathbf p, \lambda)$:**

$$
L(\mathbf{p}, \lambda)=\mathbf{p}^{T} A^{T} A \mathbf{p}-\lambda\left(\mathbf{p}^{T} \mathbf{p}-1\right)
$$

Taking derivatives of $L(\mathbf p, \lambda)$ w.r.t. $\mathbf p$:  $2 A^{T} A \mathbf p-2 \lambda\mathbf p=0$

$$
 A^{T} A \mathbf p =\lambda\mathbf p
$$

This is the **Eigenvalue Problem**. Eigenvector with smallest eigenvalue $\lambda$ of matrix $A^{T} A$  minimizes the loss function $L(\mathbf p)$

Then we rearrange solution $\mathbf p$ to form the projection matrix $P$ 

## Extracting Intrinsic and Extrinsic Matrices (from Projection Matrix)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b01a2708-992d-406e-89c5-779c747c05b8/Untitled.png)

![截屏2022-02-12 上午10.11.12.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/23a7a8ac-0d5d-4744-ac44-c603f25ec6c6/截屏2022-02-12_上午10.11.12.png)

# Simple/Calibrated Stereo (Horizontal Stereo)

## Triangulation using two cameras

![The distance between two cameras is called “Horizontal Baseline”](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/bce192ff-1661-4ce0-ad28-49b3e799036b/截屏2022-02-12_上午10.20.51.png)

The distance between two cameras is called “Horizontal Baseline”

Solving for $(x,y,z)$:

$$
x=\frac{b\left(u_{l}-o_{x}\right)}{\left(u_{l}-u_{r}\right)} \quad y=\frac{b f_{x}\left(v_{l}-o_{y}\right)}{f_{y}\left(u_{l}-u_{r}\right)} \quad z=\frac{bf_x}{\left(u_{l}-u_{r}\right)}
$$

Where $\left( u_l-u_r\right)$ is called **Disparity**.

- Depth $z$ is inversely proportional to Disparity.
- Disparity is proportional to Baseline.
    - larger the baseline, more precise the disparity is.

## Stereo Matching: Finding Disparities

Cooresponding scene points must lie on the same horizontal scan line.

- Determine Disparity using Template Matching.
    
    ![截屏2022-02-12 上午10.53.21.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8139951c-26c8-4edf-946b-6428c7513e88/截屏2022-02-12_上午10.53.21.png)
    

### Similarity Differences for Template Matching

![截屏2022-02-12 上午10.54.08.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/19e7cc40-428a-4242-97a6-1eac67bc6a6e/截屏2022-02-12_上午10.54.08.png)

### Issues with Stereo Matching

- Surface must have non-repetitive texture(pattern)
- Foreshortening effects makes matching challenging

### Window Size

![截屏2022-02-12 上午10.58.15.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6d2b00ee-b884-4abb-bb7b-83a349b54bf1/截屏2022-02-12_上午10.58.15.png)

# Uncalibrated Stereo

> “Method to estimate/recover 3D structure of a static scene from two arbitrary views”
> 

Assume that:

- Intrinsics $(f_x, f_y, o_x, o_y)$ are known for both views/cameras.
- Extrinsics (relative position/orientation of cameras) are unknown.

![截屏2022-02-12 上午11.21.20.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3251062d-df10-431d-aaaa-b9bae6b3ec75/截屏2022-02-12_上午11.21.20.png)

### Procedure:

1. Assume Camera Matrix $K$ is known for each camera
2. Find a few/set of Reliable Corresponding Points/Features
3. Find Relative Camera Position $\mathrm{t}$ and Orientation $R$
4. Find Dense Correspondence ( e.g. using SIFT or hand-picked )
5. Compute Depth using Triangulation

## Epipolar Geometry

![截屏2022-02-12 下午2.59.12.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0f215f78-cf5b-4a6d-a7d9-65d5a86da0bf/截屏2022-02-12_下午2.59.12.png)

- Epipoles: Image point of origin/pinhole of one camera as viewed by the other camera.
    - $\mathbf{e}
    _{l}$ *and $\mathbf{e}_{r}$* are the epipoles.
    - $*\mathbf{e}_{l}$* and *$\mathbf{e}_{r}$* are unique for a given stereo pair.
- Epipolar Plane of Scene Point $P$ : The plane formed by camera origins $\left(O_{l}\right.$ , $\left.O_{r}\right)$, epipoles $\left(\mathbf{e}_{l}\right. , \left.\mathbf{e}_{r}\right)$ and scene point $P$.
    - Every scene point lies on a unique epipolar plane.
- Epipolar Constraint: Vector normal to the epipolar plane: $\mathbf n=t\times \mathbf{x}_{l}$
    - $\mathbf{x}_{l} \cdot\left(\mathrm{t} \times \mathbf{x}_{l}\right)=0$

## Esssential Matrix

### Definition

- *Derivation*
    
    From the epipolar constraint:
    
    $$
    \begin{aligned}
    &\left[\begin{array}{lll}
    x_{l} & y_{l} & z_{l}
    \end{array}\right]\left[\begin{array}{l}
    t_{y} z_{l}-\iota_{z} y_{l} \\
    t_{z} x_{l}-t_{x} z_{l} \\
    t_{x} y_{l}-t_{y} x_{l}
    \end{array}\right]=0 \quad \text { Cross-product definition }\\
    &\left[\begin{array}{lll}
    x_{l} & y_{l} & z_{l}
    \end{array}\right]\left[\begin{array}{ccc}
    0 & -t_{z} & t_{y} \\
    t_{z} & 0 & -t_{x} \\
    -t_{y} & t_{x} & 0
    \end{array}\right]\left[\begin{array}{l}
    x_{l} \\
    y_{l} \\
    z_{l}
    \end{array}\right]=0 \quad \text { Matrix-vector form }
    \end{aligned}
    $$
    
    $\mathbf{t}_{3 \times 1}$  **: Position of Right Camera in Left Camera's Frame
    *$R_{3 \times 3}$* : Orientation of Left Camera in Right Camera's Frame
    
    $$
    \mathbf{x}_{l}=R \mathbf{x}_{r}+\mathbf{t} \quad\left[\begin{array}{l}
    x_{l} \\
    y_{l} \\
    z_{l}
    \end{array}\right]=\left[\begin{array}{lll}
    r_{11} & r_{12} & r_{13} \\
    r_{21} & r_{22} & r_{23} \\
    r_{31} & r_{32} & r_{33}
    \end{array}\right]\left[\begin{array}{l}
    x_{r} \\
    y_{r} \\
    z_{r}
    \end{array}\right]+\left[\begin{array}{l}
    t_{x} \\
    t_{y} \\
    t_{z}
    \end{array}\right]
    $$
    
    Substituting into the epipolar constraint gives:
    
    $$
    \left[\begin{array}{lll}
    x_{l} & y_{l} & z_{l}
    \end{array}\right]\left(\left[\begin{array}{ccc}
    0 & -t_{z} & t_{y} \\
    t_{z} & 0 & -t_{x} \\
    -t_{y} & t_{x} & 0
    \end{array}\right]\left[\begin{array}{lll}
    r_{11} & r_{12} & r_{13} \\
    r_{21} & r_{22} & r_{23} \\
    r_{31} & r_{32} & r_{33}
    \end{array}\right]\left[\begin{array}{l}
    x_{r} \\
    y_{r} \\
    z_{r}
    \end{array}\right]+\left[\begin{array}{ccc}
    0 & -t_{z} & t_{y} \\
    t_{z} & 0 & -t_{x} \\
    -t_{y} & t_{x} & 0
    \end{array}\right]\left[\begin{array}{l}
    t_{x} \\
    t_{y} \\
    t_{z}
    \end{array}\right]\right)=0
    $$
    
    Cause: $\mathbf t \times \mathbf t =0$, we have:
    
    $$
    \left[\begin{array}{lll}
    x_{l} & y_{l} & z_{l}
    \end{array}\right]\left[\begin{array}{lll}
    e_{11} & e_{12} & e_{13} \\
    e_{21} & e_{22} & e_{23} \\
    e_{31} & e_{32} & e_{33}
    \end{array}\right]\left[\begin{array}{l}
    x_{r} \\
    y_{r} \\
    z_{r}
    \end{array}\right]=0
    $$
    

$$
⁍
$$

Given that $T_{\times}$is a Skew-Symmetric matrix $\left(a_{i j}=-a_{j i}\right)$ and $R$ is an Orthonormal matrix, it is possible to "decouple" $T_{\times}$ and $R$ from their product using "Singular Value Decomposition".

- **If $E$ is known, we can calculate $\mathbf t$ and $R$**

$$
E=T_{\times} R
$$

$$
\left[\begin{array}{lll}
e_{11} & e_{12} & e_{13} \\
e_{21} & e_{22} & e_{23} \\
e_{31} & e_{32} & e_{33}
\end{array}\right]=\left[\begin{array}{ccc}
0 & -t_{z} & t_{y} \\
t_{z} & 0 & -t_{x} \\
-t_{y} & t_{x} & 0
\end{array}\right]\left[\begin{array}{lll}
r_{11} & r_{12} & r_{13} \\
r_{21} & r_{22} & r_{23} \\
r_{31} & r_{32} & r_{33}
\end{array}\right]
$$

### How to get Essential Matrix ?

We don’t have $\mathbf x_l$ (3D position in left camera coordinates) and $\mathbf x_r$, we do know cooresponding points in image coordinates.

## Fundamental Matrix

- *Derivation:*
    
    Perspective projection equations for left camera:
    
    $$
    \begin{aligned}
    u_{l} &=f_{x}^{(l)} \frac{x_{l}}{z_{l}}+o_{x}^{(l)} & v_{l} &=f_{y}^{(l)} \frac{y_{l}}{z_{l}}+o_{y}^{(l)} \\
    z_{l} u_{l} &=f_{x}^{(l)} x_{l}+z_{l} o_{x}^{(l)} & z_{l} v_{l} &=f_{y}^{(l)} y_{l}+z_{l} o_{y}^{(l)}
    \end{aligned}
    $$
    
    In matrix form:
    
    $$
    Z_{l}\left[\begin{array}{c}
    u_{l} \\
    v_{l} \\
    1
    \end{array}\right]=\left[\begin{array}{c}
    Z_{l} u_{l} \\
    Z_{l} v_{l} \\
    Z_{l}
    \end{array}\right]=\left[\begin{array}{ccc}
    f_{x}^{(l)} x_{l}+Z_{l} o_{x}^{(l)} \\
    f_{y}^{(l)} y_{l}+Z_{l} o_{y}^{(l)} \\
    Z_{l}
    \end{array}\right]=\left[\begin{array}{ccc}
    f_{x}^{(l)} & 0 & o_{x}^{(l)} \\
    0 & f_{y}^{(l)} & o_{y}^{(l)} \\
    0 & 0 & 1
    \end{array}\right]\left[\begin{array}{l}
    x_{l} \\
    y_{l} \\
    z_{l}
    \end{array}\right]
    $$
    
    $$
    \begin{aligned}
    \text{Left camera}\quad&\mathbf{x}_{l}^{T}=\left[\begin{array}{lll}
    u_{l} & v_{l} & 1
    \end{array}\right] z_{l} {K_{l}^{-1}}^{T}\\
    &\text{Right camera}\quad\mathbf{x}_{r}=K_{r}^{-1} z_{r}\left[\begin{array}{c}
    u_{r} \\
    v_{r} \\
    1
    \end{array}\right]
    \end{aligned}
    $$
    
    Rewrite epipolar constraint:
    
    $$
    \left[\begin{array}{lll}
    u_{l} & v_{l} & 1
    \end{array}\right] z_{l} {K_{l}^{-1}}^T\left[\begin{array}{lll}
    e_{11} & e_{12} & e_{13} \\
    e_{21} & e_{22} & e_{23} \\
    e_{31} & e_{32} & e_{33}
    \end{array}\right] K_{r}^{-1} z_{r}\left[\begin{array}{c}
    u_{r} \\
    v_{r} \\
    1
    \end{array}\right]=0
    $$
    
    And $z_l, z_r ≠ 0$
    
    $$
    \left[\begin{array}{lll}
    u_{l} & v_{l} & 1
    \end{array}\right]{K_{l}^{-1}}^T\left[\begin{array}{lll}
    e_{11} & e_{12} & e_{13} \\
    e_{21} & e_{22} & e_{23} \\
    e_{31} & e_{32} & e_{33}
    \end{array}\right] K_{r}^{-1} \left[\begin{array}{c}
    u_{r} \\
    v_{r} \\
    1
    \end{array}\right]=0
    $$
    

### Definition

$$
\left[\begin{array}{lll}
u_{l} & v_{l} & 1
\end{array}\right]\left[\begin{array}{lll}
f_{11} & f_{12} & f_{13} \\
f_{21} & f_{22} & f_{23} \\
f_{31} & f_{32} & f_{33}
\end{array}\right]\left[\begin{array}{c}
u_{r} \\
v_{r} \\
1
\end{array}\right]=0
$$

$$
E=K_{l}^{T} F K_{r}
$$

### Estimating Fundamental Matrix and T, R

1. For each coorespondence *i,* write out the epipolar constraint:
    
    $$
    \left[\begin{array}{lll}
    u_{l} & v_{l} & 1
    \end{array}\right]\left[\begin{array}{lll}
    f_{11} & f_{12} & f_{13} \\
    f_{21} & f_{22} & f_{23} \\
    f_{31} & f_{32} & f_{33}
    \end{array}\right]\left[\begin{array}{c}
    u_{r} \\
    v_{r} \\
    1
    \end{array}\right]=0
    $$
    
    then expand the matrix to get linear equation
    
2. Rearrange the terms to form a linear system: $A \mathbf f = 0$
    
    ![截屏2022-02-12 下午4.41.38.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/19ecf180-b8b5-4bb0-b6ab-28afba6b60b1/截屏2022-02-12_下午4.41.38.png)
    
3. Find least squares solution for fundamental matrix $F$. 
Fundamental matrix acts on homogeneous coordinates. Set fundamental matrix to some arbitrary scale.
then rearrange solution $\mathbf f$ to get form the fundamental matrix F

$$
\min _\mathbf{f}\|A \mathbf f\|^{2} \quad \text { such that }\|\mathbf f\|^{2}=1
$$

1. Compute essential matrix $E$ from known left and right intrinsic camera matrices and fundamental matrix $F$.

$$
E=K_{l}^{T} F K_{r}
$$

1. Extract $R$ and $\mathbf{t}$ from $E$.(Using Singular Value Decomposition)

$$
E=T_{\times} R
$$

## Finding Coorespondences

![截屏2022-02-12 下午4.55.27.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/55d65a2d-558a-4e9b-873e-cc97a009bd48/截屏2022-02-12_下午4.55.27.png)

- **Epipolar Line:** Intersection of image plane and epiplar plane ( e.g. $\mathbf u_l \mathbf e_l$ and $\mathbf u_r \mathbf e_r$ )
    - **Given a point in one image, the corresponding point in the other image must lie on the epipolar line.**
    - **Finding correspondence reduces to a 1D search**.

### Finding Epipolar Lines

![截屏2022-02-12 下午5.00.10.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f379d7ca-76e5-421f-b1c7-d4e2919614e9/截屏2022-02-12_下午5.00.10.png)

## Computing Depth using Triangulation

*Left Camera Imaging Equation:*

$$
\begin{gathered}
{\left[\begin{array}{c}
u_{l} \\
v_{l} \\
1
\end{array}\right] \equiv\left[\begin{array}{cccc}
f_{x}^{(l)} & 0 & o_{x}^{(l)} & 0 \\
0 & f_{y}^{(l)} & o_{y}^{(l)} & 0 \\
0 & 0 & 1 & 0
\end{array}\right]\left[\begin{array}{cccc}
r_{11} & r_{12} & r_{13} & t_{x} \\
r_{21} & r_{22} & r_{23} & t_{y} \\
r_{31} & r_{32} & r_{33} & t_{z} \\
0 & 0 & 0 & 1
\end{array}\right]\left[\begin{array}{c}
x_{r} \\
y_{r} \\
z_{r} \\
1
\end{array}\right]} \\
\tilde{\mathbf{u}_{\boldsymbol{l}}}=P_{l} \tilde{\mathbf{x}}_{\boldsymbol{r}}
\end{gathered}
$$

*Right Camera Imaging Equation:*

$$
\begin{gathered}
{\left[\begin{array}{c}
u{r} \\
v_{r} \\
1
\end{array}\right] \equiv\left[\begin{array}{cccc}
f_{x}^{(r)} & 0 & o_{x}^{(r)} & 0 \\
0 & f_{y}^{(r)} & o_{y}^{(r)} & 0 \\
0 & 0 & 1 & 0
\end{array}\right]\left[\begin{array}{c}
x_{r} \\
y_{r} \\
z_{r} \\
1
\end{array}\right]} \\
\widetilde{\mathbf{u}}_{r}=M_{i n t_{r}} \widetilde{\mathbf{x}}_{r}
\end{gathered}
$$

![截屏2022-02-12 下午5.08.53.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/38d4d572-4767-44b8-8223-83be777674af/截屏2022-02-12_下午5.08.53.png)

![截屏2022-02-12 下午5.09.50.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/dcb6a42f-85d4-491a-9881-daa36a5fd851/截屏2022-02-12_下午5.09.50.png)

Find **least squares solution** using **pseudo-inverse**:

$$
\begin{gathered}
A \mathbf{x}{r}=\mathbf{b} \\
A^{T} A \mathbf{x}{r}=A^{T} \mathbf{b} \\
\mathbf{x}_{r}=\left(A^{T} A\right)^{-1} A^{T} \mathbf{b}
\end{gathered}
$$

Applications:

- 3D reconstruction with Internet Images
- Active Stereo Results
    
    ![截屏2022-02-12 下午5.13.49.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/256c0766-1815-4a87-96c4-bb94e132365c/截屏2022-02-12_下午5.13.49.png)
    

# Stereo Vision in Nature

- Predator eyes are configured for depth estimation
- Prey eyes are configured for larger field of view